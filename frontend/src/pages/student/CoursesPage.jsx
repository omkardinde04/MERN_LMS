import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLocalData, setLocalData } from '@/utils/storage';
import { getUser } from '@/utils/auth';
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
    const [refresh, setRefresh] = useState(0);
    const currentUser = getUser();
    
    // Initialize state for course data
    const [announcements] = useState(getLocalData('announcements', []));
    const [assignments] = useState(getLocalData('assignments', []));
    const [grades] = useState(getLocalData('grades', []));
    
    // Get only enrolled courses for the current student
    const studentEnrollments = getLocalData('studentEnrollments', {});
    const userEnrollments = studentEnrollments[currentUser?.id] || [];
    const allCourses = getLocalData('allCourses', []);
    
    // Only show courses where the student is enrolled
    const enrolledCourses = allCourses.filter(course => 
        userEnrollments.includes(course.id)
    );

    useEffect(() => {
		// Update UI when other tabs change localStorage (storage event)
		const onStorage = (e) => {
			if (!e.key) return;
			const keysToWatch = ['courseAnnouncements', 'courseAssignments', 'courseGrades', 'courseStudents'];
			if (keysToWatch.includes(e.key)) {
				setRefresh(r => r + 1);
			}
		};

		// Also listen for a custom event dispatched after setLocalData in same-tab updates
		const onLocalDataChanged = (e) => {
			const key = e?.detail?.key;
			if (!key) return;
			const keysToWatch = ['courseAnnouncements', 'courseAssignments', 'courseGrades', 'courseStudents'];
			if (keysToWatch.includes(key)) {
				setRefresh(r => r + 1);
			}
		};

		window.addEventListener('storage', onStorage);
		window.addEventListener('local-data-changed', onLocalDataChanged);

		return () => {
			window.removeEventListener('storage', onStorage);
			window.removeEventListener('local-data-changed', onLocalDataChanged);
		};
	}, []);

    const getCourseAnnouncements = (courseId) => {
        const courseAnnouncements = getLocalData('courseAnnouncements', {});
        return courseAnnouncements[courseId] || [];
    };

    const getCourseAssignments = (courseId) => {
        const courseAssignments = getLocalData('courseAssignments', {});
        return courseAssignments[courseId] || [];
    };

    const getCourseGrades = (courseId) => {
        const courseGrades = getLocalData('courseGrades', {});
        return courseGrades[courseId] || null;
    };

    const handleEnroll = () => {
        if (!currentUser) {
            toast.error('Please log in to enroll in courses');
            return;
        }

        const code = enrollmentCode.trim();
        if (!code) {
            toast.error('Please enter an enrollment code');
            return;
        }

        // Get enrollment codes and verify
        const enrollmentCodes = getLocalData('enrollmentCodes', {});
        const enrollmentDetails = enrollmentCodes[code];

        // Verify the code exists and is active
        if (!enrollmentDetails || !enrollmentDetails.active) {
            toast.error('Invalid or expired enrollment code');
            return;
        }

        // Get the course details from faculty's courses
        const courses = getLocalData('courses', []);
        const course = courses.find(c => c.id === enrollmentDetails.courseId);
        
        if (!course) {
            toast.error('Course not found. Please contact your instructor.');
            return;
        }

        // Check if already enrolled
        const studentEnrollments = getLocalData('studentEnrollments', {});
        const userEnrollments = studentEnrollments[currentUser?.id] || [];
        
        if (userEnrollments.includes(course.id)) {
            toast.error('You are already enrolled in this course');
            return;
        }

        try {
            // Add to student enrollments
            const updatedEnrollments = [...userEnrollments, course.id];
            studentEnrollments[currentUser.id] = updatedEnrollments;
            setLocalData('studentEnrollments', studentEnrollments);

            // Add to course's student list
            const courseStudents = getLocalData('courseStudents', {});
            const newStudent = {
                id: Date.now(),
                studentId: currentUser.id,
                name: currentUser.fullName || 'Unknown Student',
                email: currentUser.email,
                addedDate: new Date().toISOString(),
                enrolledVia: code
            };

            courseStudents[course.id] = [...(courseStudents[course.id] || []), newStudent];
            setLocalData('courseStudents', courseStudents);

            // Update course statistics
            const updatedCourses = courses.map(c => 
                c.id === course.id 
                    ? { ...c, students: (c.students || 0) + 1 }
                    : c
            );
            setLocalData('courses', updatedCourses);

            // Add course to all courses list if not exists
            const allCourses = getLocalData('allCourses', []);
            if (!allCourses.find(c => c.id === course.id)) {
                setLocalData('allCourses', [...allCourses, course]);
            }

            toast.success(`Successfully enrolled in ${course.name}`);
            setEnrollDialogOpen(false);
            setEnrollmentCode('');

            // Trigger storage event for other tabs
            try {
                window.localStorage.setItem('courseStudents_lastUpdate', String(Date.now()));
                window.dispatchEvent(new CustomEvent('local-data-changed', { 
                    detail: { key: 'courseStudents' } 
                }));
            } catch(e) {}

            window.location.reload();

        } catch (error) {
            console.error('Enrollment error:', error);
            toast.error('Failed to enroll in the course. Please try again.');
        }
    };

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

            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {enrolledCourses.map((course, index) => {
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
            ) : (
                <Card className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Use an enrollment code to join your first course
                    </p>
                    <Button onClick={() => setEnrollDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Enter Enrollment Code
                    </Button>
                </Card>
            )}
        </div>
    );
}
