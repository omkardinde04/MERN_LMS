import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { setUser } from '@/utils/storage';
import { User, Mail, Hash, Lock, Moon, Sun, BookOpen, FileText, Brain, Code, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        id: '',
        password: '',
        rememberMe: false,
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!formData.email.endsWith('@somaiya.edu')) {
            newErrors.email = 'Email must end with @somaiya.edu';
        }

        if (!formData.id.trim()) {
            newErrors.id = 'ID is required';
        } else if (!/^\d{4}$/.test(formData.id)) {
            newErrors.id = 'ID must be exactly 4 digits';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        // Determine role based on ID (if ends with 0, it's a student)
        const role = formData.id.endsWith('0') ? 'student' : 'faculty';

        // Create user object
        const user = {
            fullName: formData.fullName,
            email: formData.email,
            id: formData.id,
            role: role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName}`,
        };

        // Save to localStorage
        setUser(user);

        toast.success('Login successful!');

        // Navigate based on role
        if (role === 'student') {
            navigate('/student');
        } else {
            navigate('/faculty');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const features = [
        { icon: BookOpen, title: 'Course Management', desc: 'Access materials and announcements.' },
        { icon: FileText, title: 'Assignments', desc: 'Track deadlines and submit work.' },
        { icon: Brain, title: 'AI Quizzes', desc: 'Test your knowledge instantly.' },
        { icon: Code, title: 'Coding Zone', desc: 'Practice coding live.' },
        { icon: Calendar, title: 'Calendar & Schedule', desc: 'Stay organized.' },
        { icon: MessageSquare, title: 'Feedback', desc: 'Share your thoughts.' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left side - Yellow branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between text-primary-foreground">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-learnify-lg"
                    >
                        <span className="text-5xl font-bold text-primary">L</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl font-bold mb-4"
                    >
                        Welcome to Learnify
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg mb-12"
                    >
                        Your integrated platform for courses, assignments, collaboration, and AI-powered learning tools.
                    </motion.p>

                    <div className="grid grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                className="flex gap-3"
                            >
                                <feature.icon className="h-6 w-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-base">{feature.title}</h3>
                                    <p className="text-sm opacity-90">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full"
                        >
                            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </Button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-0 shadow-none bg-transparent">
                            <CardHeader className="space-y-2 px-0">
                                <CardTitle className="text-3xl font-bold text-black">Sign In</CardTitle>
                                <CardDescription className="text-base text-muted-foreground">
                                    Enter your credentials to access your dashboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground z-10" />
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="pl-10 w-full"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {errors.fullName && (
                                            <p className="text-sm text-destructive">{errors.fullName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground z-10" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="your.email@somaiya.edu"
                                                className="pl-10 w-full"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="id">4-Digit ID</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground z-10" />
                                            <Input
                                                id="id"
                                                name="id"
                                                type="text"
                                                placeholder="Enter 4-digit ID"
                                                className="pl-10 w-full"
                                                value={formData.id}
                                                onChange={handleChange}
                                                maxLength={4}
                                            />
                                        </div>
                                        {errors.id && (
                                            <p className="text-sm text-destructive">{errors.id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <button
                                                type="button"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground z-10" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                className="pl-10 w-full"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-destructive">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-2 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        />
                                        <Label htmlFor="rememberMe" className="text-sm font-medium text-foreground">
                                            Remember me
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold"
                                    >
                                        Sign In
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
