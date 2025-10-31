import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getUser, getLocalData } from '@/utils/storage';
import { BookOpen, Users, FileCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
    const navigate = useNavigate();
    const user = getUser();
    const courses = getLocalData('courses', []);
    const students = getLocalData('students', []);
    const timetable = getLocalData('timetable', []);

    const stats = [
        { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'bg-blue-500' },
        { label: 'Total Students', value: students.length, icon: Users, color: 'bg-green-500' },
        { label: 'Pending Grading', value: 12, icon: FileCheck, color: 'bg-orange-500' },
        { label: 'Upcoming Classes', value: timetable.length, icon: Clock, color: 'bg-purple-500' },
    ];

    const todaySchedule = timetable.slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, Prof. {user?.fullName?.split(' ')[1] || user?.fullName}! 👋</h1>
                    <p className="text-muted-foreground mt-1">Here's an overview of your teaching activities</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/faculty/settings')}
                >
                    <Avatar className="h-12 w-12 cursor-pointer border-2 border-primary">
                        <AvatarImage src={user?.avatar} alt={user?.fullName} />
                        <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                        <CardDescription>Your classes for today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {todaySchedule.map((schedule, index) => (
                            <div key={index} className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{schedule.courseName}</p>
                                        <p className="text-sm text-muted-foreground">{schedule.type} • {schedule.room}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{schedule.time}</p>
                                        <p className="text-xs text-muted-foreground">Class {schedule.class}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Progress</CardTitle>
                        <CardDescription>Completion status of your courses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {courses.slice(0, 4).map((course) => (
                            <div key={course.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">{course.name}</p>
                                    <p className="text-sm text-muted-foreground">{course.progress}%</p>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
