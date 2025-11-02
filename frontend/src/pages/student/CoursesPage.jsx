import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUser } from '@/utils/storage';
import { studentAPI } from '@/utils/api';
import { BookOpen, Bell, FileText, TrendingUp, AlertTriangle, PlusCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CoursesPage() {
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [enrollmentCode, setEnrollmentCode] = useState('');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = getUser();

    // Load courses from backend
    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getCourses();
            if (response.success) {
                setEnrolledCourses(response.data || []);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleEnroll = async () => {
        if (!enrollmentCode || enrollmentCode.trim() === '') {
            toast.error('Please enter an enrollment code');
            return;
        }

        try {
            const response = await studentAPI.enrollInCourse(enrollmentCode.trim());
            if (response.success) {
                toast.success(response.message || 'Successfully enrolled in course!');
                setEnrollDialogOpen(false);
                setEnrollmentCode('');
                loadCourses(); // Reload courses to show the new one
            }
        } catch (error) {
            toast.error(error.message || 'Failed to enroll in course');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <p className="text-muted-foreground mt-1">Loading courses...</p>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <p className="text-muted-foreground mt-1">View your enrolled courses</p>
                </div>
                <Button onClick={() => setEnrollDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Enroll in Course
                </Button>
            </div>

            {/* Enrollment Dialog */}
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enroll in Course</DialogTitle>
                        <DialogDescription>
                            Enter the course code provided by your instructor
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="enrollmentCode">Course Code</Label>
                            <Input
                                id="enrollmentCode"
                                placeholder="e.g., CS101"
                                value={enrollmentCode}
                                onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
                            />
                        </div>
                        <Button className="w-full" onClick={handleEnroll}>
                            Enroll Now
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {enrolledCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                                {course.name}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {course.code} • {course.instructor} • Class {course.class}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{course.credits} Credits</p>
                                            <p className="text-xs text-muted-foreground">{course.semester}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Progress</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-background rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{course.progress}%</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Enrolled Students: {course.enrolledStudents}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Enter a course code to join your first course
                    </p>
                    <Button onClick={() => setEnrollDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Enroll in Course
                    </Button>
                </Card>
            )}
        </div>
    );
}
