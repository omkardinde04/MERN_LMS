import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    BookOpen,
    FileText,
    Code,
    TrendingUp,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeUser } from '@/utils/storage';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const navItems = [
    { to: '/student', icon: Home, label: 'Home', exact: true },
    { to: '/student/courses', icon: BookOpen, label: 'Courses' },
    { to: '/student/assignments', icon: FileText, label: 'Assignments' },
    { to: '/student/coding-zone', icon: Code, label: 'Coding Zone' },
    { to: '/student/grades', icon: TrendingUp, label: 'Grades' },
    { to: '/student/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/student/feedback', icon: MessageSquare, label: 'Feedback' },
    { to: '/student/settings', icon: Settings, label: 'Settings' },
];

export default function StudentSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path, exact) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        removeUser();
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link to="/student" className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"
                    >
                        <GraduationCap className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                        <h1 className="text-xl font-bold">Learnify</h1>
                        <p className="text-xs text-muted-foreground">Student Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to, item.exact);

                    return (
                        <Link key={item.to} to={item.to} className="block">
                            <Button
                                variant={active ? 'default' : 'ghost'}
                                className="w-full justify-start gap-3"
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    );
}
