import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { codeStarters } from '@/utils/mockData';
import { getUser } from '@/utils/storage';
import { studentAPI } from '@/utils/api';
import { Play, Send, Loader2, Code2, Download, Settings, Star, MessageSquare, FileCode, Calendar, Eye, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// --- API Configurations ---
// NOTE: All API calls now go through backend proxy for security

const languageMap = {
    'python': { name: 'python', version: '3.10.0', extension: 'py', displayName: 'Python' },
    'java': { name: 'java', version: '15.0.2', extension: 'java', displayName: 'Java' },
    'cpp': { name: 'c++', version: '10.2.0', extension: 'cpp', displayName: 'C++' },
    'c': { name: 'c', version: '10.2.0', extension: 'c', displayName: 'C' }
};

// --- Helper Functions ---

/**
 * Calls the backend proxy to execute code (Piston API through backend).
 */
const executeCodeWithAPI = async (lang, codeText, stdin) => {
    try {
        const langConfig = languageMap[lang];
        if (!langConfig) {
            throw new Error('Language not supported for API execution');
        }

        // Use backend proxy via studentAPI
        const response = await studentAPI.executeCode({
            language: langConfig.name,
            code: codeText,
            stdin: stdin || ''
        });

        if (response.success && response.data) {
            return {
                success: response.data.executionSuccess || false,
                output: response.data.output || '[No output]',
                language: lang
            };
        } else {
            throw new Error(response.message || 'Execution failed');
        }

    } catch (error) {
        console.error('Code execution error:', error);
        return {
            success: false,
            output: `[EXECUTION FAILED]\n${error.message || 'Unknown error occurred'}`,
            language: lang
        };
    }
};

// AI feedback is now handled by backend - this function is kept for fallback only
async function getCodeFeedback(codeContent, language) {
    // This should not be used anymore - backend handles AI feedback
    return generateMockFeedback(codeContent, language);
}

/**
 * Generates mock AI feedback when API key is not available.
 */
function generateMockFeedback(codeContent, language) {
    const lines = codeContent.split('\n').filter(l => l.trim().length > 0).length;
    const hasComments = codeContent.includes('//') || codeContent.includes('/*') || codeContent.includes('#');
    const hasFunctions = codeContent.includes('def ') || codeContent.includes('function ') || codeContent.includes('void ') || codeContent.includes('public ');

    let feedback = `### AI Code Analysis\n\n`;
    feedback += `**Code Overview:**\n`;
    feedback += `- Language: ${language.toUpperCase()}\n`;
    feedback += `- Lines of code: ${lines}\n\n`;

    feedback += `**Strengths:**\n`;
    if (hasComments) {
        feedback += `- Good use of comments to explain code logic\n`;
    }
    if (hasFunctions) {
        feedback += `- Code is well-structured with proper function definitions\n`;
    }
    feedback += `- Code appears to follow basic ${language} conventions\n\n`;

    feedback += `**Suggestions for Improvement:**\n`;
    if (!hasComments) {
        feedback += `- Consider adding comments to explain complex logic\n`;
    }
    feedback += `- Review variable naming for better readability\n`;
    feedback += `- Consider adding error handling where appropriate\n`;
    feedback += `- Look for opportunities to optimize loops and conditionals\n\n`;

    feedback += `**Best Practices:**\n`;
    feedback += `- Follow consistent indentation and formatting\n`;
    feedback += `- Break down complex functions into smaller, reusable pieces\n`;
    feedback += `- Add input validation for robust code\n\n`;

    feedback += `*Note: This is mock feedback. For detailed AI analysis, please add a valid Gemini API key.*`;

    return feedback;
}

/**
 * Calculates a simple score based on code and execution.
 */
const calculateScore = (codeContent, executionSuccess) => {
    let score = 0;
    let explanation = [];

    if (codeContent.trim().length === 0) {
        return { score: 0, explanation: ['No code submitted'] };
    }

    // Base score for effort
    score += 10;
    explanation.push('Base effort: +10 points');

    // Score for code length
    const lines = codeContent.split('\n').filter(l => l.trim().length > 0).length;
    const lengthScore = Math.min(lines * 2, 40);
    score += lengthScore;
    explanation.push(`Code length (${lines} lines): +${lengthScore} points`);

    // Big bonus for successful run
    if (executionSuccess) {
        score += 50;
        explanation.push('Successful execution: +50 points');
    } else {
        explanation.push('Execution failed or not tested: +0 points');
    }

    return {
        score: Math.min(score, 100),
        explanation: explanation
    };
};


// --- Component ---

export default function CodingZonePage() {
    // Load language from localStorage or default to python
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('codingZone_language');
        return saved || 'python';
    });
    const [code, setCode] = useState(() => {
        const saved = localStorage.getItem('codingZone_code');
        const savedLang = localStorage.getItem('codingZone_language') || 'python';
        return saved || codeStarters?.[savedLang] || `# Write your ${savedLang.toUpperCase()} code here\nprint("Hello, World!")`;
    });
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState(null);
    const [scoreExplanation, setScoreExplanation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isExecutionSuccess, setIsExecutionSuccess] = useState(false); // Track last run
    const [showCustomInputs, setShowCustomInputs] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [codeSubmissions, setCodeSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const user = getUser();

    // Load code submissions from backend
    const loadCodeSubmissions = async () => {
        try {
            setLoadingSubmissions(true);
            const response = await studentAPI.getCodeSubmissions();
            if (response.success) {
                setCodeSubmissions(response.data || []);
            }
        } catch (error) {
            console.error('Error loading code submissions:', error);
            toast.error('Failed to load code submissions');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    // Load submissions on mount
    useEffect(() => {
        loadCodeSubmissions();
    }, []);

    // Save code to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('codingZone_code', code);
    }, [code]);

    const getLanguageBadge = (lang) => {
        const colors = {
            python: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            java: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            cpp: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            c: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
            javascript: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        };
        return colors[lang] || 'bg-muted text-muted-foreground';
    };

    const handleDeleteSubmission = async (submissionId) => {
        // Note: Backend doesn't have delete endpoint yet
        toast.info('Delete functionality coming soon');
        // Future implementation:
        // await studentAPI.deleteCodeSubmission(submissionId);
        // loadCodeSubmissions();
    };

    const downloadCode = () => {
        const langConfig = languageMap[language];
        const extension = langConfig ? langConfig.extension : 'txt';

        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Code downloaded successfully');
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('codingZone_language', newLanguage);
        const starter = codeStarters?.[newLanguage] || `// Write your ${newLanguage.toUpperCase()} code here`;
        setCode(starter);
        localStorage.setItem('codingZone_code', starter);
        setOutput('');
        setScore(null);
        setScoreExplanation('');
        setFeedback('');
        setIsExecutionSuccess(false);
        toast.info(`Switched to ${languageMap[newLanguage]?.displayName || newLanguage.toUpperCase()}`);
    };

    const handleRunCode = async () => {
        if (isRunning || isSubmitting) return;

        setIsRunning(true);
        setOutput(`Executing ${language.toUpperCase()} code using Piston API...\n--- Please Wait ---`);
        setIsExecutionSuccess(false); // Reset success state
        setScore(null);
        setFeedback('');

        try {
            toast.info('Executing code on remote server...');
            const result = await executeCodeWithAPI(language, code, customInput);

            setOutput(result.output);
            setIsExecutionSuccess(result.success); // Store success of this run

            if (result.success) {
                toast.success('Code executed successfully!');
            } else {
                toast.error('Execution finished with errors.');
            }
        } catch (error) {
            setOutput(`[FATAL ERROR]\n${error.message}`);
            setIsExecutionSuccess(false);
            toast.error('Failed to execute code');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        if (isRunning || isSubmitting) return;

        setIsSubmitting(true);
        setFeedback('Generating AI feedback, please wait...');
        setScore(null);
        toast.info("Submitting code and generating AI feedback...");

        try {
            const langConfig = languageMap[language];
            const fileName = `code.${langConfig?.extension || 'txt'}`;

            // Submit code to backend - AI feedback is generated server-side
            const response = await studentAPI.submitCode({
                code,
                language,
                fileName,
                output: output || '',
                executionSuccess: isExecutionSuccess,
                problemId: 'coding-zone'
            });

            if (response.success && response.data) {
                const submission = response.data;
                
                // Set AI feedback from backend
                setFeedback(submission.aiFeedback || 'No feedback available');
                setScore(submission.score || 0);
                
                // Update output panel
                setOutput(`--- Submission Results ---
Status: Submitted Successfully
Score: ${submission.score || 0}/100
(Based on code length and execution status)

--- AI Feedback ---
${submission.aiFeedback || 'No feedback available'}
`);

                // Reload code submissions list
                loadCodeSubmissions();

                toast.success('Code submitted successfully! AI feedback generated.');
            } else {
                throw new Error(response.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Submit code error:', error);
            toast.error(`Submission failed: ${error.message || 'Unknown error'}`);
            setFeedback(`Failed to submit code: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Coding Zone</h1>
                <p className="text-muted-foreground mt-1">Practice coding with live execution and AI feedback</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 space-y-4"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-primary" />
                                    Code Editor
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowCustomInputs(!showCustomInputs)}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        {showCustomInputs ? 'Hide' : 'Show'} Options
                                    </Button>
                                    <Select value={language} onValueChange={handleLanguageChange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue>{languageMap[language]?.displayName || language}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="python">Python</SelectItem>
                                            <SelectItem value="java">Java</SelectItem>
                                            <SelectItem value="cpp">C++</SelectItem>
                                            <SelectItem value="c">C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <CardDescription>Write your code below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="font-mono text-sm min-h-[400px] bg-slate-950 dark:bg-slate-950 text-green-400 dark:text-green-400 border-slate-700 focus:border-primary focus:ring-primary placeholder:text-slate-500 rounded-lg p-4 leading-relaxed"
                                placeholder="Write your code here..."
                                spellCheck="false"
                            />

                            {showCustomInputs && (
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Custom Input (stdin)</label>
                                        <Textarea
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            className="font-mono text-sm h-24 bg-slate-950 dark:bg-slate-950 text-cyan-400 dark:text-cyan-400 border-slate-700 focus:border-primary focus:ring-primary placeholder:text-slate-500 rounded-lg p-3"
                                            placeholder="Enter custom input for your program (e.g., test data)..."
                                            spellCheck="false"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleRunCode} disabled={isRunning || isSubmitting} className="flex-1">
                                    {isRunning ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Run Code
                                        </>
                                    )}
                                </Button>
                                <Button onClick={handleSubmitCode} disabled={isSubmitting || isRunning} variant="secondary" className="flex-1">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit & Get Feedback
                                        </>
                                    )}
                                </Button>
                                <Button onClick={downloadCode} variant="outline" disabled={isRunning || isSubmitting}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Output */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Output</CardTitle>
                            <CardDescription>Execution results and submission feedback will appear here</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px] w-full rounded-lg border border-slate-700 bg-slate-950 p-4">
                                {output ? (
                                    <pre className={`text-sm font-mono whitespace-pre-wrap ${!isExecutionSuccess && !isSubmitting ? 'text-red-400' : 'text-slate-300'
                                        }`}>{output}</pre>
                                ) : (
                                    <p className="text-sm text-slate-500">Run your code to see the output...</p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    {/* Score Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-primary" />
                                Basic Score
                            </CardTitle>
                            <CardDescription>Score based on last execution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {score !== null ? (
                                <div className="text-center">
                                    <div className={`text-5xl font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-primary' : 'text-destructive'
                                        }`}>{score}</div>
                                    <p className="text-sm text-muted-foreground mt-2">out of 100</p>
                                    <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className={`h-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-primary' : 'bg-destructive'
                                                }`}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">Submit your code to get a score</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Feedback Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                AI Feedback
                            </CardTitle>
                            <CardDescription>Powered by Google Gemini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] w-full">
                                {isSubmitting ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mt-2">Generating feedback...</p>
                                    </div>
                                ) : feedback ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                        {feedback.split('\n').map((line, i) => {
                                            if (line.startsWith('##')) {
                                                return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace('##', '')}</h2>;
                                            } else if (line.startsWith('###')) {
                                                return <h3 key={i} className="text-base font-semibold mt-3 mb-1 text-foreground">{line.replace('###', '')}</h3>;
                                            } else if (line.startsWith('*')) {
                                                return <li key={i} className="ml-4">{line.replace('*', '')}</li>;
                                            } else if (line.startsWith('-')) {
                                                return <li key={i} className="ml-4">{line.replace('-', '')}</li>;
                                            } else if (line.trim()) {
                                                return <p key={i} className="mb-2">{line}</p>;
                                            }
                                            return <br key={i} />;
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-muted-foreground">Submit your code to receive AI-powered feedback and suggestions</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Code Submissions Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-primary" />
                        Code Submissions
                    </CardTitle>
                    <CardDescription>View your submitted code with AI feedback</CardDescription>
                </CardHeader>
                <CardContent>
                    {codeSubmissions.length > 0 ? (
                        <div className="space-y-3">
                            {codeSubmissions.map((submission, index) => (
                                <motion.div
                                    key={submission.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`border ${getLanguageBadge(submission.language)}`}>
                                                    {submission.language?.toUpperCase()}
                                                </Badge>
                                                <span className="text-sm font-medium">{submission.fileName}</span>
                                                {submission.score !== null && submission.score !== undefined && (
                                                    <Badge variant="outline" className="ml-auto">
                                                        Score: {submission.score}/100
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                                                </div>
                                                {submission.executionSuccess !== undefined && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={submission.executionSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                            {submission.executionSuccess ? 'Executed Successfully' : 'Execution Failed'}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {submission.aiFeedback && (
                                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-900 dark:text-blue-200 line-clamp-2">
                                                    AI Feedback: {submission.aiFeedback.substring(0, 150)}...
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedSubmission(submission);
                                                    setIsPreviewOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteSubmission(submission.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground">No code submissions yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Submit your code to see it here</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submission Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>{selectedSubmission?.fileName}</DialogTitle>
                        <DialogDescription>
                            Submitted on {selectedSubmission && new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge className={getLanguageBadge(selectedSubmission?.language)}>
                                {selectedSubmission?.language?.toUpperCase()}
                            </Badge>
                            {selectedSubmission?.score !== null && (
                                <Badge variant="outline">
                                    Score: {selectedSubmission?.score}/100
                                </Badge>
                            )}
                            {selectedSubmission?.executionSuccess !== undefined && (
                                <Badge variant={selectedSubmission?.executionSuccess ? 'default' : 'destructive'}>
                                    {selectedSubmission?.executionSuccess ? 'Executed Successfully' : 'Execution Failed'}
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-semibold">Code:</p>
                            <ScrollArea className="h-[300px] border rounded-lg bg-slate-950 p-4">
                                <pre className="text-sm font-mono text-slate-100 whitespace-pre-wrap">
                                    <code>{selectedSubmission?.code || selectedSubmission?.codeContent || 'No code content'}</code>
                                </pre>
                            </ScrollArea>
                        </div>
                        {selectedSubmission?.output && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Output:</p>
                                <ScrollArea className="h-[150px] border rounded-lg bg-slate-950 p-4">
                                    <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
                                        {selectedSubmission.output}
                                    </pre>
                                </ScrollArea>
                            </div>
                        )}
                        {(selectedSubmission?.aiFeedback || selectedSubmission?.feedback) && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">AI Feedback:</p>
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-200">
                                        {(selectedSubmission.aiFeedback || selectedSubmission.feedback || '').split('\n').map((line, i) => {
                                            if (line.startsWith('##')) {
                                                return <h2 key={i} className="text-base font-bold mt-3 mb-1">{line.replace('##', '')}</h2>;
                                            } else if (line.startsWith('###')) {
                                                return <h3 key={i} className="text-sm font-semibold mt-2 mb-1">{line.replace('###', '')}</h3>;
                                            } else if (line.startsWith('*') || line.startsWith('-')) {
                                                return <li key={i} className="ml-4 text-sm">{line.substring(1)}</li>;
                                            } else if (line.trim()) {
                                                return <p key={i} className="text-sm mb-1">{line}</p>;
                                            }
                                            return <br key={i} />;
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}