import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLocalData } from '@/utils/storage';
import { Search, Mail, User, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentsPage() {
    const courseStudents = getLocalData('courseStudents', {});
    const courses = getLocalData('courses', []);
    const [searchQuery, setSearchQuery] = useState('');

    // Group students by course with actual enrolled students
    const studentsByCourse = courses.map(course => {
        const enrolledStudents = courseStudents[course.id] || [];
        
        // Filter by search query if provided
        const filteredStudents = searchQuery 
            ? enrolledStudents.filter(student => {
                const query = searchQuery.toLowerCase();
                return (
                    student.name?.toLowerCase().includes(query) ||
                    student.email?.toLowerCase().includes(query)
                );
            })
            : enrolledStudents;
            
        return {
            ...course,
            students: filteredStudents
        };
    }).filter(course => course.students.length > 0 || !searchQuery);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Students by Course</h1>
                <p className="text-muted-foreground mt-1">View enrolled students for each course</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by student or course name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Students by Course */}
            <div className="space-y-6">
                {studentsByCourse.length > 0 ? (
                    studentsByCourse.map((course, courseIndex) => (
                        <motion.div
                            key={course.id || courseIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: courseIndex * 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{course.name || 'Unknown Course'}</span>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {course.students.length} {course.students.length === 1 ? 'student' : 'students'}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>
                                        {course.code || 'N/A'} • {course.class || 'N/A'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {course.students.length > 0 ? (
                                        <div className="rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12">#</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead className="text-right">Enrolled Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {course.students.map((student, index) => (
                                                        <TableRow key={student.id || index}>
                                                            <TableCell className="font-medium text-muted-foreground">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-medium">{student.name || 'Unknown Student'}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span className="text-sm">{student.email || 'N/A'}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                                {student.addedDate ? new Date(student.addedDate).toLocaleDateString() : 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>No students enrolled in this course</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <Card className="p-12 text-center">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery ? 'No matching students found' : 'No courses available'}
                        </h3>
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? 'Try adjusting your search criteria'
                                : 'Courses and students will appear here once created'}
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}