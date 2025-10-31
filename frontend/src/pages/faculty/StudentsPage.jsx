import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLocalData } from '@/utils/storage';
import { Search, Mail, Phone, Calendar, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentsPage() {
    const [students] = useState(getLocalData('students', []));
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase();
        return (
            student.name?.toLowerCase().includes(query) ||
            student.studentId?.toLowerCase().includes(query) ||
            student.email?.toLowerCase().includes(query) ||
            student.course?.toLowerCase().includes(query)
        );
    });

    const stats = [
        { label: 'Total Students', value: students.length },
        { label: 'Active', value: students.filter(s => s.status === 'Active').length },
        { label: 'Average GPA', value: '3.45' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Students</h1>
                <p className="text-muted-foreground mt-1">Manage and view student information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Student Directory</CardTitle>
                            <CardDescription>Browse and search students</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student, index) => (
                                        <TableRow key={student.id || index}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={student.avatar} />
                                                        <AvatarFallback>
                                                            {student.name?.split(' ').map(n => n[0]).join('') || 'S'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{student.name || 'Unknown'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {student.studentId || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{student.email || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{student.course || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{student.year || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                                    }`}>
                                                    {student.status || 'Active'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchQuery ? 'No students found' : 'No students yet'}
                            </h3>
                            <p className="text-muted-foreground">
                                {searchQuery
                                    ? 'Try adjusting your search criteria'
                                    : 'Students will appear here once they enroll'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
