import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getLocalData, setLocalData } from '@/utils/storage';
import { Brain, Clock, CheckCircle2, XCircle, ArrowRight, BookOpen, Trash2, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function QuizzesPage() {
    const courses = getLocalData('courses', []);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(null);
    const [completedQuizzes, setCompletedQuizzes] = useState(getLocalData('completedQuizzes', []));
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [aiFeedback, setAiFeedback] = useState('');
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

    // Generate quiz questions dynamically based on course
    const generateQuiz = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return null;

        const questionTypes = [
            {
                question: `What is the main focus of ${course.name}?`,
                options: [
                    'Programming fundamentals',
                    'Advanced concepts',
                    'Practical applications',
                    'All of the above'
                ],
                correct: 3
            },
            {
                question: `Which topic is most important in ${course.name}?`,
                options: [
                    'Theory',
                    'Practice',
                    'Both equally',
                    'Depends on the course'
                ],
                correct: 2
            },
            {
                question: `How would you rate your understanding of ${course.name}?`,
                options: [
                    'Beginner',
                    'Intermediate',
                    'Advanced',
                    'Expert'
                ],
                correct: 1
            },
            {
                question: `What is a key concept in ${course.name}?`,
                options: [
                    'Basic principles',
                    'Complex algorithms',
                    'Problem solving',
                    'All concepts are important'
                ],
                correct: 3
            },
            {
                question: `How can you improve in ${course.name}?`,
                options: [
                    'Practice regularly',
                    'Study theory',
                    'Work on projects',
                    'All of the above'
                ],
                correct: 3
            }
        ];

        // Add more questions based on course name
        const additionalQuestions = [];
        if (course.name.toLowerCase().includes('programming') || course.code === 'CS101') {
            additionalQuestions.push({
                question: 'What is the purpose of a loop in programming?',
                options: [
                    'To repeat code execution',
                    'To store variables',
                    'To print output',
                    'To define functions'
                ],
                correct: 0
            });
            additionalQuestions.push({
                question: 'Which data structure follows LIFO principle?',
                options: ['Queue', 'Stack', 'Array', 'Linked List'],
                correct: 1
            });
        }
        if (course.name.toLowerCase().includes('database') || course.code === 'CS301') {
            additionalQuestions.push({
                question: 'What is a primary key in a database?',
                options: [
                    'A foreign key',
                    'A unique identifier',
                    'A duplicate value',
                    'A null value'
                ],
                correct: 1
            });
        }

        const allQuestions = [...questionTypes, ...additionalQuestions];
        const selectedQuestions = allQuestions.slice(0, Math.min(10, allQuestions.length));

        return {
            id: Date.now(),
            courseId: courseId,
            courseName: course.name,
            questions: selectedQuestions,
            totalQuestions: selectedQuestions.length,
            timePerQuestion: 60, // seconds per question
            createdAt: new Date().toISOString()
        };
    };

    const startQuiz = () => {
        if (!selectedCourse) {
            toast.error('Please select a course');
            return;
        }

        const quiz = generateQuiz(selectedCourse);
        if (!quiz) {
            toast.error('Could not generate quiz');
            return;
        }

        const totalTime = quiz.totalQuestions * quiz.timePerQuestion;
        setCurrentQuiz(quiz);
        setQuizStarted(true);
        setTimeRemaining(totalTime);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuizCompleted(false);
        setScore(null);
    };

    useEffect(() => {
        if (quizStarted && !quizCompleted && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [quizStarted, quizCompleted, timeRemaining]);

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = () => {
        if (!currentQuiz) return;

        let correctAnswers = 0;
        currentQuiz.questions.forEach((q, index) => {
            if (answers[index] === q.correct) {
                correctAnswers++;
            }
        });

        const finalScore = Math.round((correctAnswers / currentQuiz.totalQuestions) * 100);
        setScore(finalScore);
        setQuizCompleted(true);
        setQuizStarted(false);

        const quizResult = {
            ...currentQuiz,
            answers: answers,
            score: finalScore,
            correctAnswers: correctAnswers,
            completedAt: new Date().toISOString()
        };

        const updated = [...completedQuizzes, quizResult];
        setCompletedQuizzes(updated);
        setLocalData('completedQuizzes', updated);

        toast.success(`Quiz completed! Score: ${finalScore}%`);

        // Generate AI feedback automatically
        generateAIFeedback(quizResult);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDeleteQuiz = (quizId) => {
        const updated = completedQuizzes.filter(q => q.id !== quizId);
        setCompletedQuizzes(updated);
        setLocalData('completedQuizzes', updated);
        toast.success('Quiz history deleted');
        setDeleteDialogOpen(false);
        setQuizToDelete(null);
    };

    const openDeleteDialog = (quiz) => {
        setQuizToDelete(quiz);
        setDeleteDialogOpen(true);
    };

    const generateAIFeedback = (quizResult) => {
        setIsGeneratingFeedback(true);

        // Generate mock AI feedback based on quiz performance
        setTimeout(() => {
            let feedback = `### Performance Analysis for ${quizResult.courseName}\n\n`;

            if (quizResult.score >= 90) {
                feedback += `**Excellent Performance! 🌟**\n\n`;
                feedback += `**Strengths:**\n`;
                feedback += `- Outstanding understanding of the subject matter\n`;
                feedback += `- Consistently accurate responses across all topics\n`;
                feedback += `- Strong grasp of both fundamental and advanced concepts\n\n`;
                feedback += `**Next Steps:**\n`;
                feedback += `- Challenge yourself with more advanced topics\n`;
                feedback += `- Consider helping peers who are struggling\n`;
                feedback += `- Explore real-world applications of these concepts\n`;
            } else if (quizResult.score >= 70) {
                feedback += `**Good Performance! 👍**\n\n`;
                feedback += `**Strengths:**\n`;
                feedback += `- Solid understanding of core concepts\n`;
                feedback += `- Good performance on fundamental questions\n`;
                feedback += `- Demonstrating consistent learning progress\n\n`;
                feedback += `**Areas for Improvement:**\n`;
                feedback += `- Review topics where you lost points\n`;
                feedback += `- Practice more complex problem-solving scenarios\n`;
                feedback += `- Deepen understanding of advanced concepts\n\n`;
                feedback += `**Recommendations:**\n`;
                feedback += `- Revisit course materials for weak areas\n`;
                feedback += `- Take additional practice quizzes\n`;
                feedback += `- Discuss challenging topics with instructors\n`;
            } else if (quizResult.score >= 50) {
                feedback += `**Needs Improvement 📚**\n\n`;
                feedback += `**Current Status:**\n`;
                feedback += `- Basic understanding present but needs reinforcement\n`;
                feedback += `- Some fundamental concepts need more attention\n\n`;
                feedback += `**Action Plan:**\n`;
                feedback += `- Review all course materials systematically\n`;
                feedback += `- Focus on understanding core concepts before advanced topics\n`;
                feedback += `- Practice with additional exercises and examples\n`;
                feedback += `- Consider forming a study group with classmates\n`;
                feedback += `- Schedule office hours with your instructor\n\n`;
                feedback += `**Study Tips:**\n`;
                feedback += `- Break down complex topics into smaller parts\n`;
                feedback += `- Create summary notes for each major concept\n`;
                feedback += `- Practice active recall instead of passive reading\n`;
            } else {
                feedback += `**Significant Review Required 🎯**\n\n`;
                feedback += `**Immediate Actions:**\n`;
                feedback += `- Schedule a meeting with your instructor immediately\n`;
                feedback += `- Review all foundational materials from the beginning\n`;
                feedback += `- Identify specific topics causing difficulty\n`;
                feedback += `- Consider tutoring or additional support resources\n\n`;
                feedback += `**Recommended Strategy:**\n`;
                feedback += `- Start with the basics and build up gradually\n`;
                feedback += `- Use multiple learning resources (videos, textbooks, practice)\n`;
                feedback += `- Take detailed notes and review them daily\n`;
                feedback += `- Practice problems regularly, not just before quizzes\n`;
                feedback += `- Don't hesitate to ask questions in class\n\n`;
                feedback += `**Remember:** Everyone learns at their own pace. Consistent effort and the right support will lead to improvement!\n`;
            }

            // Add specific topic analysis
            feedback += `\n**Topic Analysis:**\n`;
            const incorrectQuestions = quizResult.questions.filter((q, i) => quizResult.answers[i] !== q.correct);
            if (incorrectQuestions.length > 0) {
                feedback += `You missed ${incorrectQuestions.length} question(s). Focus your review on these areas.\n`;
            }

            feedback += `\n**Score Breakdown:**\n`;
            feedback += `- Correct Answers: ${quizResult.correctAnswers}/${quizResult.totalQuestions}\n`;
            feedback += `- Accuracy Rate: ${quizResult.score}%\n`;
            feedback += `- Time Taken: Quiz completed\n`;

            setAiFeedback(feedback);
            setIsGeneratingFeedback(false);
        }, 1500); // Simulate AI processing time
    };

    const downloadFeedback = () => {
        if (!aiFeedback || !currentQuiz) return;

        const content = `Quiz Feedback - ${currentQuiz.courseName}\n`;
        const header = `Generated on: ${new Date().toLocaleDateString()}\n`;
        const separator = `${'='.repeat(50)}\n\n`;
        const fullContent = content + header + separator + aiFeedback;

        const blob = new Blob([fullContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quiz_Feedback_${currentQuiz.courseName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Feedback downloaded successfully');
    };

    const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Quizzes</h1>
                <p className="text-muted-foreground mt-1">Test your knowledge with dynamic quizzes</p>
            </div>

            {!quizStarted && !quizCompleted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                Create a Quiz
                            </CardTitle>
                            <CardDescription>Select a course to generate a personalized quiz</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Subject</Label>
                                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.name} ({course.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedCourse && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium mb-2">Quiz Details:</p>
                                    <p className="text-xs text-muted-foreground">
                                        • Questions will be generated dynamically based on the selected course
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        • Time per question: 60 seconds
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        • Total time will be calculated based on number of questions
                                    </p>
                                </div>
                            )}
                            <Button onClick={startQuiz} className="w-full" disabled={!selectedCourse}>
                                <Brain className="h-4 w-4 mr-2" />
                                Start Quiz
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {quizStarted && currentQuiz && !quizCompleted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{currentQuiz.courseName} Quiz</CardTitle>
                                    <CardDescription>
                                        Question {currentQuestionIndex + 1} of {currentQuiz.totalQuestions}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="font-bold text-primary">{formatTime(timeRemaining)}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
                                <div className="space-y-2">
                                    {currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[currentQuestionIndex] === index
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQuestionIndex] === index
                                                        ? 'border-primary bg-primary'
                                                        : 'border-border'
                                                    }`}>
                                                    {answers[currentQuestionIndex] === index && (
                                                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                                    )}
                                                </div>
                                                <span>{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    {Object.keys(answers).length} / {currentQuiz.totalQuestions} answered
                                </div>
                                {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                                    <Button onClick={handleSubmitQuiz}>
                                        Submit Quiz
                                    </Button>
                                ) : (
                                    <Button onClick={handleNext}>
                                        Next
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {quizCompleted && score !== null && currentQuiz && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {score >= 70 ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-destructive" />
                                )}
                                Quiz Results
                            </CardTitle>
                            <CardDescription>{currentQuiz.courseName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6">
                                <div className={`text-6xl font-bold mb-2 ${score >= 70 ? 'text-green-500' : score >= 50 ? 'text-primary' : 'text-destructive'
                                    }`}>
                                    {score}%
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    You got {currentQuiz.correctAnswers || 0} out of {currentQuiz.totalQuestions} questions correct
                                </p>
                                <div className="mt-6 space-y-2">
                                    {currentQuiz.questions.map((q, index) => {
                                        const isCorrect = answers[index] === q.correct;
                                        return (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg border-2 ${isCorrect
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : 'border-destructive bg-red-50 dark:bg-red-900/20'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{q.question}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Correct answer: {q.options[q.correct]}
                                                        </p>
                                                        {!isCorrect && (
                                                            <p className="text-xs text-destructive mt-1">
                                                                Your answer: {q.options[answers[index]] || 'Not answered'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isCorrect ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 ml-2" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* AI Performance Feedback Section */}
                                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            AI Performance Feedback
                                        </h4>
                                        {aiFeedback && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={downloadFeedback}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                    {isGeneratingFeedback ? (
                                        <div className="text-center py-6">
                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                                            <p className="text-sm text-muted-foreground">Generating personalized feedback...</p>
                                        </div>
                                    ) : aiFeedback ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground max-h-[400px] overflow-y-auto">
                                            {aiFeedback.split('\n').map((line, i) => {
                                                if (line.startsWith('###')) {
                                                    return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace('###', '')}</h3>;
                                                } else if (line.startsWith('**') && line.endsWith('**')) {
                                                    return <h4 key={i} className="text-base font-semibold mt-3 mb-1 text-foreground">{line.replace(/\*\*/g, '')}</h4>;
                                                } else if (line.startsWith('-')) {
                                                    return <li key={i} className="ml-4 mb-1">{line.replace('-', '').trim()}</li>;
                                                } else if (line.trim()) {
                                                    return <p key={i} className="mb-2">{line}</p>;
                                                }
                                                return <br key={i} />;
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Feedback will be generated after quiz completion</p>
                                    )}
                                </div>

                                <Button
                                    className="mt-6"
                                    onClick={() => {
                                        setQuizCompleted(false);
                                        setCurrentQuiz(null);
                                        setScore(null);
                                        setSelectedCourse('');
                                    }}
                                >
                                    Take Another Quiz
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Quiz History */}
            {completedQuizzes.length > 0 && !quizStarted && !quizCompleted && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Quiz History
                        </CardTitle>
                        <CardDescription>Your completed quizzes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {completedQuizzes.slice().reverse().map((quiz) => (
                            <div
                                key={quiz.id}
                                className="p-4 bg-muted rounded-lg border border-border"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{quiz.courseName}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(quiz.completedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${quiz.score >= 70 ? 'text-green-500' : quiz.score >= 50 ? 'text-primary' : 'text-destructive'
                                                }`}>
                                                {quiz.score}%
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {quiz.correctAnswers}/{quiz.totalQuestions} correct
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDeleteDialog(quiz)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz History</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this quiz result for "{quizToDelete?.courseName}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteQuiz(quizToDelete?.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

