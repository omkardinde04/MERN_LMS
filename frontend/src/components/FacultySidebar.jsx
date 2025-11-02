import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Calendar,
    Users,
    Brain,
    Code,
    Settings,
    LogOut,
    GraduationCap,
    MessageSquare,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeUser } from '@/utils/storage';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const navItems = [
    { to: '/faculty', icon: Home, label: 'Dashboard', exact: true },
    { to: '/faculty/courses', icon: BookOpen, label: 'Courses' },
    { to: '/faculty/timetable', icon: Calendar, label: 'Timetable' },
    { to: '/faculty/students', icon: Users, label: 'Students' },
    { to: '/faculty/assignments', icon: FileText, label: 'Assignments' },
    { to: '/faculty/feedback', icon: MessageSquare, label: 'Feedback' },
    { to: '/faculty/ai-quiz', icon: Brain, label: 'AI Quiz Creator' },
    { to: '/faculty/code-submissions', icon: Code, label: 'Code Submissions' },
];

export default function FacultySidebar() {
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
        <div className="w-64 h-screen bg-card border-r border-border flex flex-col shadow-learnify">
            {/* Logo */}
            <div className="p-6 border-b border-border bg-card">
                <Link to="/faculty" className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm"
                    >
                        <GraduationCap className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Learnify</h1>
                        <p className="text-xs text-muted-foreground font-medium">Faculty Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to, item.exact);

                    return (
                        <Link key={item.to} to={item.to} className="block">
                            <Button
                                variant={active ? 'default' : 'ghost'}
                                className={`w-full justify-start gap-3 ${
                                    active 
                                        ? 'bg-primary text-primary-foreground shadow-sm' 
                                        : 'text-foreground hover:bg-primary/10'
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="font-medium">{item.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings and Logout */}
            <div className="p-4 border-t border-border bg-card space-y-2">
                <Link to="/faculty/settings" className="block">
                    <Button
                        variant={location.pathname === '/faculty/settings' ? 'default' : 'ghost'}
                        className={`w-full justify-start gap-3 ${
                            location.pathname === '/faculty/settings'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-foreground hover:bg-primary/10'
                        }`}
                    >
                        <Settings className="h-5 w-5 shrink-0" />
                        <span className="font-medium">Settings</span>
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    );
}