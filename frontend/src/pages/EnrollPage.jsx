import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLocalData, setLocalData, getUser } from '@/utils/storage';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EnrollPage() {
    const { enrollmentCode } = useParams();
    const navigate = useNavigate();
    const user = getUser();
    const [courseData, setCourseData] = useState(null);
    const [studentEmail, setStudentEmail] = useState(user?.email || '');
    const [studentName, setStudentName] = useState(user?.fullName || '');
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        // Check if enrollment code exists
        const enrollmentCodes = getLocalData('enrollmentCodes', {});
        const course = enrollmentCodes[enrollmentCode];

        if (course) {
            setCourseData(course);

            // Check if user is already enrolled
            if (user) {
                const courseStudents = getLocalData('courseStudents', {})[course.courseId] || [];
                const isEnrolled = courseStudents.some(s => s.email === user.email);
                setEnrolled(isEnrolled);
            }
        }
        setLoading(false);
    }, [enrollmentCode, user]);

    const handleEnroll = () => {
        if (!studentEmail.trim() || !studentName.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Add student to course
        const allStudents = getLocalData('courseStudents', {});
        const courseStudents = allStudents[courseData.courseId] || [];

        // Check if already enrolled
        if (courseStudents.find(s => s.email === studentEmail)) {
            toast.error('You are already enrolled in this course');
            setEnrolled(true);
            return;
        }

        const newStudent = {
            id: Date.now(),
            email: studentEmail,
            name: studentName,
            enrolledDate: new Date().toISOString()
        };

        allStudents[courseData.courseId] = [...courseStudents, newStudent];
        setLocalData('courseStudents', allStudents);

        // Update course student count
        const courses = getLocalData('courses', []);
        const updatedCourses = courses.map(c =>
            c.id === courseData.courseId ? { ...c, students: (c.students || 0) + 1 } : c
        );
        setLocalData('courses', updatedCourses);

        toast.success('Successfully enrolled in the course!');
        setEnrolled(true);

        // Redirect to login if not logged in, otherwise to student dashboard
        setTimeout(() => {
            if (user && user.role === 'student') {
                navigate('/student/courses');
            } else {
                navigate('/', { state: { message: 'Please login to access your courses' } });
            }
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <CardTitle className="text-2xl">Invalid Enrollment Link</CardTitle>
                        <CardDescription>
                            This enrollment link is not valid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/')} className="w-full">
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (enrolled) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <CardTitle className="text-2xl">Successfully Enrolled!</CardTitle>
                        <CardDescription>
                            You are now enrolled in {courseData.courseName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">Course: {courseData.courseName}</p>
                            <p className="text-sm text-muted-foreground">Code: {courseData.courseCode}</p>
                        </div>
                        <Button onClick={() => navigate(user?.role === 'student' ? '/student/courses' : '/')} className="w-full">
                            {user?.role === 'student' ? 'Go to My Courses' : 'Go to Login'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl">Enroll in Course</CardTitle>
                    <CardDescription>
                        You're about to enroll in {courseData.courseName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium">{courseData.courseName}</p>
                        <p className="text-sm text-muted-foreground">Course Code: {courseData.courseCode}</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                disabled={!!user}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                                disabled={!!user}
                            />
                        </div>
                    </div>

                    <Button onClick={handleEnroll} className="w-full">
                        Enroll in Course
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        By enrolling, you agree to participate in this course.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
