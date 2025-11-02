import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getUser, getLocalData } from '@/utils/storage';
import { BookOpen, FileText, Code, Calendar, TrendingUp, MessageSquare, Bell, ChevronRight, Moon, Sun, Award, Zap, Target } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function HomePage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const user = getUser();
    const assignments = getLocalData('assignments', []);
    const announcements = getLocalData('announcements', []);
    const events = getLocalData('events', []);

    // Get upcoming assignments (pending only)
    const upcomingAssignments = assignments
        .filter(a => a.status === 'pending')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    // Get recent announcements
    const recentAnnouncements = announcements
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    // Get upcoming events
    const upcomingEvents = events
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .filter(e => new Date(e.date) >= new Date())
        .slice(0, 3);

    // Quick stats data
    const quickStats = [
        { icon: Zap, label: 'Fast Coder', value: '92%', description: 'Above average speed', color: 'bg-yellow-500' },
        { icon: Target, label: 'Consistent Learner', value: '88%', description: 'Regular participation', color: 'bg-green-500' },
        { icon: Award, label: 'Top Performer', value: '95%', description: 'High scores', color: 'bg-blue-500' },
    ];

    const quickActions = [
        { icon: BookOpen, label: 'My Courses', path: '/student/courses', color: 'bg-blue-500' },
        { icon: FileText, label: 'Assignments', path: '/student/assignments', color: 'bg-green-500' },
        { icon: Code, label: 'Coding Zone', path: '/student/coding-zone', color: 'bg-purple-500' },
        { icon: TrendingUp, label: 'Grades', path: '/student/grades', color: 'bg-orange-500' },
        { icon: Calendar, label: 'Calendar', path: '/student/calendar', color: 'bg-red-500' },
        { icon: MessageSquare, label: 'Feedback', path: '/student/feedback', color: 'bg-pink-500' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Here's what's happening with your courses today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full"
                    >
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full p-0"
                        onClick={() => navigate('/student/settings')}
                    >
                        <Avatar className="h-12 w-12 cursor-pointer border-2 border-primary shadow-sm hover:shadow-md transition-shadow">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                                {user?.fullName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h2 className="text-xl font-bold mb-4">Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickStats.map((stat, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card className="border-2 border-border hover:border-primary/30 transition-colors">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card
                                className="cursor-pointer hover:shadow-learnify-lg transition-all hover:scale-105 border-2 border-border hover:border-primary/30"
                                onClick={() => navigate(action.path)}
                            >
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                    <div className="bg-primary p-3 rounded-lg shadow-sm">
                                        <action.icon className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upcoming Assignments */}
                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Upcoming Assignments
                            </CardTitle>
                            <CardDescription>Your pending tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {upcomingAssignments.length > 0 ? (
                                upcomingAssignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() => navigate('/student/assignments')}
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{assignment.title}</p>
                                            <p className="text-xs text-muted-foreground">{assignment.courseName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-orange-600">
                                                {new Date(assignment.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No pending assignments</p>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => navigate('/student/assignments')}
                            >
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Announcements */}
                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                Recent Announcements
                            </CardTitle>
                            <CardDescription>Latest updates from your courses</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentAnnouncements.length > 0 ? (
                                recentAnnouncements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() => navigate('/student/courses')}
                                    >
                                        <p className="font-medium text-sm">{announcement.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{announcement.content?.substring(0, 60)}...</p>
                                        <p className="text-xs text-muted-foreground mt-2">{announcement.author} • {new Date(announcement.date).toLocaleDateString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No announcements</p>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => navigate('/student/courses')}
                            >
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Upcoming Events */}
                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Upcoming Events
                            </CardTitle>
                            <CardDescription>Your calendar highlights</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() => navigate('/student/calendar')}
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{event.title}</p>
                                            <p className="text-xs text-muted-foreground">{event.courseName || event.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-primary">
                                                {new Date(event.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => navigate('/student/calendar')}
                            >
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}