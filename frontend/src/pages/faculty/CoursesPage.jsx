import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getLocalData, setLocalData, getUser } from '@/utils/storage';
import { Plus, Edit, Trash2, Users, BookOpen, Clock, Link as LinkIcon, Video, Bell, ArrowLeft, Copy, ExternalLink, Search, Laptop, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CoursesPage() {
    const [courses, setCourses] = useState(getLocalData('courses', []));
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        semester: '',
        credits: '',
        class: '',
        totalStudents: '',
    });

    // Course management states
    const [classroomLink, setClassroomLink] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingPlatform, setMeetingPlatform] = useState('google');

    // Get course-specific data
    const getCourseStudents = (courseId) => {
        return getLocalData('courseStudents', {})[courseId] || [];
    };

    const getCourseAnnouncements = (courseId) => {
        return getLocalData('courseAnnouncements', {})[courseId] || [];
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCourse) {
            const updatedCourses = courses.map(course =>
                course.id === editingCourse.id ? { ...course, ...formData } : course
            );
            setCourses(updatedCourses);
            setLocalData('courses', updatedCourses);
            toast.success('Course updated successfully');
        } else {
            const newCourse = {
                id: Date.now(),
                ...formData,
                students: 0,
                progress: 0,
                createdBy: user?.id || null,
                createdByName: user?.fullName || 'Unknown',
                ownerRole: user?.role || 'faculty',
                createdAt: new Date().toISOString(),
            };
            const updatedCourses = [...courses, newCourse];
            setCourses(updatedCourses);
            setLocalData('courses', updatedCourses);
            toast.success('Course created successfully');
        }

        setIsDialogOpen(false);
        setEditingCourse(null);
        setFormData({ name: '', code: '', description: '', semester: '', credits: '', class: '', totalStudents: '' });
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            code: course.code,
            description: course.description || '',
            semester: course.semester || '',
            credits: course.credits || '',
            class: course.class || '',
            totalStudents: course.totalStudents || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (courseId) => {
        const updatedCourses = courses.filter(course => course.id !== courseId);
        setCourses(updatedCourses);
        setLocalData('courses', updatedCourses);
        toast.success('Course deleted successfully');
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
    };

    const openDeleteDialog = (course, event) => {
        event.stopPropagation();
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleShareLink = (course) => {
        // Generate a unique enrollment link for the course
        const enrollmentCode = `${course.code}-${course.id.toString().slice(-6)}`;
        const baseUrl = window.location.origin;
        const enrollmentLink = `${baseUrl}/enroll/${enrollmentCode}`;

        // Save the enrollment code mapping
        const allEnrollmentCodes = getLocalData('enrollmentCodes', {});
        allEnrollmentCodes[enrollmentCode] = {
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            createdAt: new Date().toISOString()
        };
        setLocalData('enrollmentCodes', allEnrollmentCodes);

        // Save the link for this course
        const allLinks = getLocalData('courseLinks', {});
        allLinks[course.id] = enrollmentLink;
        setLocalData('courseLinks', allLinks);

        toast.success('Course enrollment link generated successfully');
    };

    const handleRegenerateLink = (course) => {
        handleShareLink(course);
        toast.success('New enrollment link generated');
    };

    const handleCopyLink = (course) => {
        const link = getLocalData('courseLinks', {})[course.id];
        if (link) {
            navigator.clipboard.writeText(link);
            toast.success('Link copied to clipboard');
        } else {
            toast.error('No classroom link set for this course');
        }
    };

    const handleAddStudent = (course) => {
        if (newStudentEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudentEmail)) {
            const allStudents = getLocalData('courseStudents', {});
            const courseStudents = allStudents[course.id] || [];

            if (courseStudents.find(s => s.email === newStudentEmail)) {
                toast.error('Student already added');
                return;
            }

            const newStudent = {
                id: Date.now(),
                email: newStudentEmail,
                name: newStudentEmail.split('@')[0],
                addedDate: new Date().toISOString()
            };

            allStudents[course.id] = [...courseStudents, newStudent];
            setLocalData('courseStudents', allStudents);

            // Update course student count
            const updatedCourses = courses.map(c =>
                c.id === course.id ? { ...c, students: (c.students || 0) + 1 } : c
            );
            setCourses(updatedCourses);
            setLocalData('courses', updatedCourses);

            toast.success('Student added successfully');
            setNewStudentEmail('');
        } else {
            toast.error('Please enter a valid email address');
        }
    };

    const handleRemoveStudent = (course, studentId) => {
        const allStudents = getLocalData('courseStudents', {});
        const courseStudents = allStudents[course.id] || [];
        allStudents[course.id] = courseStudents.filter(s => s.id !== studentId);
        setLocalData('courseStudents', allStudents);

        // Update course student count
        const updatedCourses = courses.map(c =>
            c.id === course.id ? { ...c, students: Math.max((c.students || 0) - 1, 0) } : c
        );
        setCourses(updatedCourses);
        setLocalData('courses', updatedCourses);

        toast.success('Student removed');
    };

    const handleCreateAnnouncement = (course) => {
        if (announcementTitle.trim() && announcementContent.trim()) {
            const allAnnouncements = getLocalData('courseAnnouncements', {});
            const courseAnnouncements = allAnnouncements[course.id] || [];

            const newAnnouncement = {
                id: Date.now(),
                title: announcementTitle,
                content: announcementContent,
                date: new Date().toISOString(),
                courseId: course.id
            };

            allAnnouncements[course.id] = [newAnnouncement, ...courseAnnouncements];
            setLocalData('courseAnnouncements', allAnnouncements);

            toast.success('Announcement posted successfully');
            setAnnouncementTitle('');
            setAnnouncementContent('');
        } else {
            toast.error('Please fill in all fields');
        }
    };

    const handleCreateMeeting = (course) => {
        if (meetingTitle.trim()) {
            const meetingLink = meetingPlatform === 'google'
                ? `https://meet.google.com/new?title=${encodeURIComponent(meetingTitle)}`
                : `https://zoom.us/start/videomeeting?title=${encodeURIComponent(meetingTitle)}`;

            window.open(meetingLink, '_blank');
            toast.success(`Opening ${meetingPlatform === 'google' ? 'Google Meet' : 'Zoom'} to create meeting`);
            setMeetingTitle('');
        } else {
            toast.error('Please enter a meeting title');
        }
    };

    const user = getUser();
    // allow common faculty/instructor/admin role names (case-insensitive)
    const canCreate = !!user && ['faculty', 'teacher', 'instructor', 'professor', 'admin'].includes((user.role || '').toLowerCase());

    if (selectedCourse) {
        const courseStudents = getCourseStudents(selectedCourse.id);
        const courseAnnouncements = getCourseAnnouncements(selectedCourse.id);
        const savedLink = getLocalData('courseLinks', {})[selectedCourse.id] || '';

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Courses
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{selectedCourse.name}</CardTitle>
                        <CardDescription>{selectedCourse.code} • {selectedCourse.semester}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="classroom">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="classroom">
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Enrollment Link
                                </TabsTrigger>
                                <TabsTrigger value="students">
                                    <Users className="h-4 w-4 mr-2" />
                                    Students
                                </TabsTrigger>
                                <TabsTrigger value="announcements">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Announcements
                                </TabsTrigger>
                                <TabsTrigger value="meetings">
                                    <Video className="h-4 w-4 mr-2" />
                                    Meetings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="classroom" className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-base font-semibold">Course Enrollment Link</Label>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Share this link with students to allow them to enroll in your course
                                        </p>
                                    </div>

                                    {savedLink ? (
                                        <div className="space-y-3">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-sm font-medium mb-2">Enrollment Link:</p>
                                                        <code className="text-sm bg-background px-3 py-2 rounded border block overflow-x-auto">
                                                            {savedLink}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleCopyLink(selectedCourse)}
                                                >
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Link
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleRegenerateLink(selectedCourse)}
                                                >
                                                    <LinkIcon className="h-4 w-4 mr-2" />
                                                    Regenerate Link
                                                </Button>
                                            </div>
                                            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                                <p className="text-sm">
                                                    <span className="font-semibold">Enrollment Code:</span> {savedLink.split('/').pop()}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Students can use this code to join the course
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground mb-4">
                                                No enrollment link generated yet
                                            </p>
                                            <Button onClick={() => handleShareLink(selectedCourse)}>
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                Generate Enrollment Link
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="students" className="space-y-4">
                                <div className="space-y-3">
                                    <Label>Add Student</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter student email"
                                            type="email"
                                            value={newStudentEmail}
                                            onChange={(e) => setNewStudentEmail(e.target.value)}
                                        />
                                        <Button onClick={() => handleAddStudent(selectedCourse)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Enrolled Students ({courseStudents.length})</Label>
                                    {courseStudents.length > 0 ? (
                                        <div className="space-y-2">
                                            {courseStudents.map(student => (
                                                <div key={student.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{student.name}</p>
                                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveStudent(selectedCourse, student.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">No students enrolled yet</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="announcements" className="space-y-4">
                                <div className="space-y-3">
                                    <Label>Create Announcement</Label>
                                    <Input
                                        placeholder="Announcement title"
                                        value={announcementTitle}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Announcement content"
                                        value={announcementContent}
                                        onChange={(e) => setAnnouncementContent(e.target.value)}
                                        rows={3}
                                    />
                                    <Button onClick={() => handleCreateAnnouncement(selectedCourse)}>
                                        <Bell className="h-4 w-4 mr-2" />
                                        Post Announcement
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>Recent Announcements</Label>
                                    {courseAnnouncements.length > 0 ? (
                                        <div className="space-y-2">
                                            {courseAnnouncements.map(announcement => (
                                                <div key={announcement.id} className="p-4 bg-muted rounded-lg">
                                                    <h4 className="font-semibold">{announcement.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {new Date(announcement.date).toLocaleDateString()} at {new Date(announcement.date).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">No announcements yet</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="meetings" className="space-y-4">
                                <div className="space-y-3">
                                    <Label>Create Meeting</Label>
                                    <Input
                                        placeholder="Meeting title"
                                        value={meetingTitle}
                                        onChange={(e) => setMeetingTitle(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant={meetingPlatform === 'google' ? 'default' : 'outline'}
                                            onClick={() => setMeetingPlatform('google')}
                                            className="flex-1"
                                        >
                                            Google Meet
                                        </Button>
                                        <Button
                                            variant={meetingPlatform === 'zoom' ? 'default' : 'outline'}
                                            onClick={() => setMeetingPlatform('zoom')}
                                            className="flex-1"
                                        >
                                            Zoom
                                        </Button>
                                    </div>
                                    <Button onClick={() => handleCreateMeeting(selectedCourse)} className="w-full">
                                        <Video className="h-4 w-4 mr-2" />
                                        Create {meetingPlatform === 'google' ? 'Google Meet' : 'Zoom'} Meeting
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Note: This will open {meetingPlatform === 'google' ? 'Google Meet' : 'Zoom'} in a new tab to create the meeting.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <p className="text-muted-foreground mt-1">Manage your course offerings</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-64"
                        />
                    </div>
                    {/* Only faculty/instructors/admin can create courses */}
                    {canCreate ? (
                        <>
                            <Button
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                                onClick={() => {
                                    setEditingCourse(null);
                                    setFormData({ name: '', code: '', description: '', semester: '', credits: '', class: '', totalStudents: '' });
                                    setIsDialogOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Course
                            </Button>

                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={(open) => {
                                    setIsDialogOpen(open);
                                    if (!open) {
                                        setEditingCourse(null);
                                    }
                                }}
                            >
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                                        <DialogDescription>
                                            {editingCourse ? 'Update course information' : 'Create a new course'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Course Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Introduction to Computer Science"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="code">Course Code</Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                value={formData.code}
                                                onChange={handleInputChange}
                                                placeholder="e.g., CS101"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="semester">Semester</Label>
                                            <Input
                                                id="semester"
                                                name="semester"
                                                value={formData.semester}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Fall 2024"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="credits">Credits</Label>
                                            <Input
                                                id="credits"
                                                name="credits"
                                                type="number"
                                                value={formData.credits}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 3"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="class">Class/Section</Label>
                                            <Input
                                                id="class"
                                                name="class"
                                                value={formData.class}
                                                onChange={handleInputChange}
                                                placeholder="e.g., TY-C1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="totalStudents">Total Students</Label>
                                            <Input
                                                id="totalStudents"
                                                name="totalStudents"
                                                type="number"
                                                value={formData.totalStudents}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 60"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Course description..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                {editingCourse ? 'Update' : 'Create'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : (
                        <Button variant="outline" disabled title="Only faculty/instructors can create courses">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                    .filter(course =>
                        !searchQuery ||
                        course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.class?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer relative bg-card border-border" onClick={() => setSelectedCourse(course)}>
                                {/* Delete button positioned at top right */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-3 right-3 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteDialog(course, e);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <CardHeader className="pb-3">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Laptop className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-1">{course.name}</CardTitle>
                                            <CardDescription className="text-xs">
                                                Prof. {course.createdByName || getUser()?.fullName || 'Unknown'}
                                            </CardDescription>
                                            <CardDescription className="text-xs mt-0.5">{course.code}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-0">
                                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                                        <GraduationCap className="h-4 w-4" />
                                        <span className="font-medium">{course.class || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{course.students || 0} Students Enrolled</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
            </div>

            {courses.length === 0 && (
                <Card className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by creating your first course
                    </p>
                    <Button onClick={() => canCreate ? setIsDialogOpen(true) : toast.error('Only faculty/instructors can create courses')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Course
                    </Button>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(courseToDelete?.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
