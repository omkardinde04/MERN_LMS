import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Sparkles, FileText, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AIQuizPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        difficulty: 'medium',
        numQuestions: '5',
        questionType: 'multiple-choice',
        context: '',
    });
    const [generatedQuiz, setGeneratedQuiz] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const generateQuiz = async (e) => {
        e.preventDefault();
        setIsGenerating(true);

        // Simulate AI generation
        setTimeout(() => {
            const mockQuiz = {
                title: `${formData.topic} Quiz`,
                difficulty: formData.difficulty,
                questions: Array.from({ length: parseInt(formData.numQuestions) }, (_, i) => ({
                    id: i + 1,
                    question: `Sample question ${i + 1} about ${formData.topic}?`,
                    type: formData.questionType,
                    options: formData.questionType === 'multiple-choice'
                        ? ['Option A', 'Option B', 'Option C', 'Option D']
                        : null,
                    correctAnswer: formData.questionType === 'multiple-choice' ? 'Option A' : 'Sample answer',
                    explanation: 'This is an explanation of the correct answer.',
                })),
            };

            setGeneratedQuiz(mockQuiz);
            setIsGenerating(false);
            toast.success('Quiz generated successfully!');
        }, 2000);
    };

    const copyQuiz = () => {
        const quizText = JSON.stringify(generatedQuiz, null, 2);
        navigator.clipboard.writeText(quizText);
        toast.success('Quiz copied to clipboard');
    };

    const downloadQuiz = () => {
        const quizText = JSON.stringify(generatedQuiz, null, 2);
        const blob = new Blob([quizText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.topic.replace(/\s+/g, '-')}-quiz.json`;
        a.click();
        toast.success('Quiz downloaded');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">AI Quiz Creator</h1>
                <p className="text-muted-foreground mt-1">Generate quizzes using AI</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Quiz Configuration
                        </CardTitle>
                        <CardDescription>
                            Customize your AI-generated quiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={generateQuiz} className="space-y-4">
                            <div>
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Data Structures, Python Basics"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="difficulty">Difficulty Level</Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value) => handleSelectChange('difficulty', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="numQuestions">Number of Questions</Label>
                                <Select
                                    value={formData.numQuestions}
                                    onValueChange={(value) => handleSelectChange('numQuestions', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 Questions</SelectItem>
                                        <SelectItem value="10">10 Questions</SelectItem>
                                        <SelectItem value="15">15 Questions</SelectItem>
                                        <SelectItem value="20">20 Questions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="questionType">Question Type</Label>
                                <Select
                                    value={formData.questionType}
                                    onValueChange={(value) => handleSelectChange('questionType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                        <SelectItem value="true-false">True/False</SelectItem>
                                        <SelectItem value="short-answer">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="context">Additional Context (Optional)</Label>
                                <Textarea
                                    id="context"
                                    name="context"
                                    value={formData.context}
                                    onChange={handleInputChange}
                                    placeholder="Provide additional context or specific areas to focus on..."
                                    rows={4}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                                        Generating Quiz...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Quiz
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Generated Quiz
                        </CardTitle>
                        <CardDescription>
                            Your AI-generated quiz will appear here
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {generatedQuiz ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b">
                                    <div>
                                        <h3 className="font-semibold text-lg">{generatedQuiz.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {generatedQuiz.questions.length} questions • {generatedQuiz.difficulty}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={copyQuiz}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={downloadQuiz}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {generatedQuiz.questions.map((q, index) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 bg-muted/50 rounded-lg"
                                        >
                                            <p className="font-medium mb-2">
                                                {q.id}. {q.question}
                                            </p>
                                            {q.options && (
                                                <div className="space-y-1 ml-4">
                                                    {q.options.map((option, i) => (
                                                        <p
                                                            key={i}
                                                            className={`text-sm ${option === q.correctAnswer
                                                                    ? 'text-green-600 font-medium dark:text-green-400'
                                                                    : 'text-muted-foreground'
                                                                }`}
                                                        >
                                                            {String.fromCharCode(65 + i)}. {option}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            {!q.options && (
                                                <p className="text-sm text-green-600 dark:text-green-400 ml-4">
                                                    Answer: {q.correctAnswer}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                {q.explanation}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No quiz generated yet</h3>
                                <p className="text-muted-foreground text-sm">
                                    Configure your quiz settings and click "Generate Quiz" to get started
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
