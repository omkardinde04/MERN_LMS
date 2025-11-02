import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLocalData } from '@/utils/storage';
import { MessageSquare, Star, FileText, Eye, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackPage() {
    const allFeedback = getLocalData('feedback', []);
    const courses = getLocalData('courses', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterRating, setFilterRating] = useState('all');

    // Filter feedback based on search and filters
    const filteredFeedback = allFeedback.filter(feedback => {
        const matchesSearch = !searchQuery || 
            feedback.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feedback.comment?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCourse = filterCourse === 'all' || feedback.courseId === filterCourse;
        const matchesRating = filterRating === 'all' || feedback.rating === parseInt(filterRating);

        return matchesSearch && matchesCourse && matchesRating;
    });

    // Calculate statistics
    const totalFeedback = allFeedback.length;
    const averageRating = totalFeedback > 0 
        ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
        : 0;
    const feedbackByCourse = courses.map(course => ({
        ...course,
        feedbackCount: allFeedback.filter(f => f.courseId === course.id).length
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Student Feedback</h1>
                <p className="text-muted-foreground mt-1">View and analyze student feedback</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Feedback</CardDescription>
                        <CardTitle className="text-3xl">{totalFeedback}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Average Rating</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            {averageRating}
                            <Star className="h-6 w-6 fill-primary text-primary" />
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Courses with Feedback</CardDescription>
                        <CardTitle className="text-3xl">
                            {feedbackByCourse.filter(c => c.feedbackCount > 0).length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search feedback..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Course</label>
                            <Select value={filterCourse} onValueChange={setFilterCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating</label>
                            <Select value={filterRating} onValueChange={setFilterRating}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Ratings" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <SelectItem key={r} value={r.toString()}>
                                            {'★'.repeat(r) + '☆'.repeat(5 - r)} ({r} stars)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        All Feedback ({filteredFeedback.length})
                    </CardTitle>
                    <CardDescription>Student feedback from all courses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {filteredFeedback.length > 0 ? (
                        filteredFeedback.map((feedback, index) => (
                            <motion.div
                                key={feedback.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 bg-muted rounded-lg border border-border"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">{feedback.courseName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < feedback.rating
                                                            ? 'fill-primary text-primary'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                />
                                            ))}
                                            <span className="text-sm text-muted-foreground ml-2">
                                                {feedback.rating}/5
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(feedback.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Feedback:
                                        </p>
                                        <p className="text-sm bg-background p-3 rounded border border-border">
                                            {feedback.comment}
                                        </p>
                                    </div>

                                    {feedback.fileName && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Attached File:
                                            </p>
                                            <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <span className="text-xs font-medium">{feedback.fileName}</span>
                                                    {feedback.fileSize && (
                                                        <span className="text-xs text-muted-foreground">
                                                            ({feedback.fileSize})
                                                        </span>
                                                    )}
                                                </div>
                                                {feedback.filePreview && feedback.fileType?.startsWith('image/') && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => window.open(feedback.filePreview, '_blank')}
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        Preview
                                                    </Button>
                                                )}
                                            </div>
                                            {feedback.filePreview && feedback.fileType?.startsWith('image/') && (
                                                <div className="relative rounded-lg overflow-hidden border border-border">
                                                    <img
                                                        src={feedback.filePreview}
                                                        alt={feedback.fileName}
                                                        className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(feedback.filePreview, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {allFeedback.length === 0 
                                    ? 'No feedback submitted yet'
                                    : 'No feedback matches your filters'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
