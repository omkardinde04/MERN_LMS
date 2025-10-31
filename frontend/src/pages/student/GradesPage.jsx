import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLocalData } from '@/utils/storage';
import { TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GradesPage() {
    const grades = getLocalData('grades', []);

    // Calculate GPA and average
    const overallScores = grades.map(g => g.overall);
    const averageGrade = overallScores.length > 0
        ? (overallScores.reduce((a, b) => a + b, 0) / overallScores.length).toFixed(2)
        : 0;
    const gpa = (averageGrade / 25).toFixed(2); // Simple GPA calculation (out of 4.0)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Grades</h1>
                <p className="text-muted-foreground mt-1">View your academic performance</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Current GPA
                            </CardTitle>
                            <CardDescription>Based on all courses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-bold text-primary">{gpa}</div>
                            <p className="text-sm text-muted-foreground mt-2">out of 4.0</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Average Grade
                            </CardTitle>
                            <CardDescription>Overall performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-bold text-primary">{averageGrade}%</div>
                            <p className="text-sm text-muted-foreground mt-2">across all courses</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Course Grades */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Course Breakdown</h2>
                {grades.map((grade, index) => (
                    <motion.div
                        key={grade.courseId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{grade.courseName}</CardTitle>
                                <CardDescription>{grade.courseId}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Assignments</p>
                                        <p className="text-2xl font-bold">{grade.assignments}%</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Quizzes</p>
                                        <p className="text-2xl font-bold">{grade.quizzes}%</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Midterm</p>
                                        <p className="text-2xl font-bold">{grade.midterm}%</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Final</p>
                                        <p className="text-2xl font-bold">{grade.final || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Overall</p>
                                        <p className="text-2xl font-bold text-primary">{grade.overall}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
