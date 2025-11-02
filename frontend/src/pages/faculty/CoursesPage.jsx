import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { facultyAPI } from '@/utils/api';
import { getUser } from '@/utils/storage';
import { Plus, Edit, Trash2, Users, BookOpen, Clock, Link as LinkIcon, Video, Bell, ArrowLeft, Copy, ExternalLink, Search, Laptop, GraduationCap, RefreshCw, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
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
        semester: 'Fall 2025',
        credits: '3',
        class: 'A',
    });
    const user = getUser();

    // Load courses from backend
    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await facultyAPI.getCourses();
            if (response.success) {
                setCourses(response.data || []);
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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.code || !formData.credits) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingCourse) {
                const response = await facultyAPI.updateCourse(editingCourse.id, formData);
                if (response.success) {
                    toast.success('Course updated successfully');
                    loadCourses();
                }
            } else {
                const response = await facultyAPI.createCourse(formData);
                if (response.success) {
                    toast.success('Course created successfully');
                    loadCourses();
                }
            }

            setIsDialogOpen(false);
            setEditingCourse(null);
            setFormData({ name: '', code: '', description: '', semester: 'Fall 2025', credits: '3', class: 'A' });
        } catch (error) {
            toast.error(error.message || 'Failed to save course');
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            code: course.code,
            description: course.description || '',
            semester: course.semester || 'Fall 2025',
            credits: course.credits || '3',
            class: course.class || 'A',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (courseId) => {
        try {
            const response = await facultyAPI.deleteCourse(courseId);
            if (response.success) {
                toast.success('Course deleted successfully');
                loadCourses();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete course');
        }
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
    };

    const openDeleteDialog = (course, event) => {
        event.stopPropagation();
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleShareLink = (course) => {
        // The enrollment code is simply the course code
        toast.success(`Enrollment code is: ${course.code}`);
        return course.code;
    };

    const handleRegenerateLink = (course) => {
        // Since we're using course code, just show it
        toast.info(`Enrollment code: ${course.code}`);
    };



    // Simplify permission check - allow all faculty to create courses
    const canCreate = true; // Remove complex role check since faculty can always create

    if (selectedCourse) {
        const courseStudents = selectedCourse.students || [];
        const savedCode = selectedCourse.code || '';

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
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="classroom">
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Enrollment Code
                                </TabsTrigger>
                                <TabsTrigger value="students">
                                    <Users className="h-4 w-4 mr-2" />
                                    Students ({courseStudents.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="classroom" className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-base font-semibold">Course Enrollment Code</Label>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Share this code with students to allow them to enroll in your course
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium mb-2">Current Enrollment Code:</p>
                                                    <code className="text-2xl font-mono bg-background px-4 py-2 rounded border block">
                                                        {savedCode}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                navigator.clipboard.writeText(savedCode);
                                                toast.success('Code copied to clipboard');
                                            }}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Code
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="students" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Enrolled Students ({courseStudents.length})</Label>
                                    {courseStudents.length > 0 ? (
                                        <div className="space-y-2">
                                            {courseStudents.map((student, idx) => (
                                                <div key={student._id || idx} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{student.fullName || student.name || 'Student'}</p>
                                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">No students enrolled yet</p>
                                    )}
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
                                    setFormData({ name: '', code: '', description: '', semester: 'Fall 2025', credits: '3', class: 'A' });
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
                                            <Label htmlFor="description">Description (Optional)</Label>
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

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
            ) : (
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
            )}

            {!loading && courses.length === 0 && (
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
