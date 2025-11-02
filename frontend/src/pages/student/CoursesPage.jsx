import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLocalData, setLocalData } from '@/utils/storage';
import { BookOpen, Bell, FileText, TrendingUp, AlertTriangle, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CoursesPage() {
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [enrollmentCode, setEnrollmentCode] = useState('');
    const courses = getLocalData('courses', []);
    const announcements = getLocalData('announcements', []);
    const assignments = getLocalData('assignments', []);
    const grades = getLocalData('grades', []);

    const getCourseAnnouncements = (courseId) => {
        return announcements.filter(a => a.courseId === courseId);
    };

    const getCourseAssignments = (courseId) => {
        return assignments.filter(a => a.courseId === courseId);
    };

    const getCourseGrades = (courseId) => {
        return grades.find(g => g.courseId === courseId);
    };

    const handleEnroll = () => {
        const code = enrollmentCode.trim();
        if (!code) {
            toast.error('Please enter an enrollment code');
            return;
        }

        // Check if code exists in enrollment codes
        const allCodes = getLocalData('enrollmentCodes', {});
        const enrollment = allCodes[code];

        if (!enrollment) {
            toast.error('Invalid enrollment code');
            return;
        }

        // Get the course details
        const allCourses = getLocalData('courses', []);
        const course = allCourses.find(c => c.id === enrollment.courseId);

        if (!course) {
            toast.error('Course not found');
            return;
        }

        // Check if already enrolled
        if (courses.find(c => c.id === course.id)) {
            toast.error('Already enrolled in this course');
            return;
        }

        // Add course to student's courses
        const updatedCourses = [...courses, course];
        setLocalData('courses', updatedCourses);

        // Update course student count
        const courseStudents = getLocalData('courseStudents', {});
        const studentData = {
            id: Date.now(),
            studentId: getUser()?.id,
            name: getUser()?.fullName || 'Student',
            email: getUser()?.email || '',
            enrolledAt: new Date().toISOString()
        };
        courseStudents[course.id] = [...(courseStudents[course.id] || []), studentData];
        setLocalData('courseStudents', courseStudents);

        toast.success(`Successfully enrolled in ${course.name}`);
        setEnrollDialogOpen(false);
        setEnrollmentCode('');
        window.location.reload(); // Refresh to show new course
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <p className="text-muted-foreground mt-1">View all your enrolled courses and their details</p>
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
                            Enter the enrollment code provided by your instructor
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="enrollmentCode">Enrollment Code</Label>
                            <Input
                                id="enrollmentCode"
                                placeholder="Enter code..."
                                value={enrollmentCode}
                                onChange={(e) => setEnrollmentCode(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" onClick={handleEnroll}>
                            Enroll
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 gap-6">
                {courses.map((course, index) => {
                    const courseAnnouncements = getCourseAnnouncements(course.id);
                    const courseAssignments = getCourseAssignments(course.id);
                    const courseGrade = getCourseGrades(course.id);

                    return (
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
                                    <Tabs defaultValue="announcements" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="announcements">
                                                <Bell className="h-4 w-4 mr-2" />
                                                Announcements
                                            </TabsTrigger>
                                            <TabsTrigger value="assignments">
                                                <FileText className="h-4 w-4 mr-2" />
                                                Assignments
                                            </TabsTrigger>
                                            <TabsTrigger value="grades">
                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                Grades
                                            </TabsTrigger>
                                            <TabsTrigger value="plagiarism">
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Plagiarism
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="announcements" className="space-y-3">
                                            {courseAnnouncements.length > 0 ? (
                                                courseAnnouncements.map(announcement => (
                                                    <div key={announcement.id} className="p-4 bg-muted rounded-lg">
                                                        <h4 className="font-semibold">{announcement.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">No announcements yet</p>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="assignments" className="space-y-3">
                                            {courseAssignments.length > 0 ? (
                                                courseAssignments.map(assignment => (
                                                    <div key={assignment.id} className="p-4 bg-muted rounded-lg flex justify-between items-center">
                                                        <div>
                                                            <h4 className="font-semibold">{assignment.title}</h4>
                                                            <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.status === 'submitted'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                                                }`}>
                                                                {assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                                                            </span>
                                                            {assignment.score && (
                                                                <p className="text-sm font-medium mt-2">{assignment.score}/{assignment.maxScore}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">No assignments</p>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="grades" className="space-y-3">
                                            {courseGrade ? (
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                    <div className="p-4 bg-muted rounded-lg text-center">
                                                        <p className="text-xs text-muted-foreground">Assignments</p>
                                                        <p className="text-2xl font-bold mt-1">{courseGrade.assignments}%</p>
                                                    </div>
                                                    <div className="p-4 bg-muted rounded-lg text-center">
                                                        <p className="text-xs text-muted-foreground">Quizzes</p>
                                                        <p className="text-2xl font-bold mt-1">{courseGrade.quizzes}%</p>
                                                    </div>
                                                    <div className="p-4 bg-muted rounded-lg text-center">
                                                        <p className="text-xs text-muted-foreground">Midterm</p>
                                                        <p className="text-2xl font-bold mt-1">{courseGrade.midterm}%</p>
                                                    </div>
                                                    <div className="p-4 bg-muted rounded-lg text-center">
                                                        <p className="text-xs text-muted-foreground">Final</p>
                                                        <p className="text-2xl font-bold mt-1">{courseGrade.final || 'N/A'}</p>
                                                    </div>
                                                    <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg text-center">
                                                        <p className="text-xs text-muted-foreground">Overall</p>
                                                        <p className="text-2xl font-bold text-primary mt-1">{courseGrade.overall}%</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">No grades available</p>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="plagiarism">
                                            <div className="p-8 text-center">
                                                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-sm text-muted-foreground">No plagiarism reports</p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
