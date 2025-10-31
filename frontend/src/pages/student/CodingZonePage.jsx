import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { codeStarters } from '@/utils/mockData'; // This file is provided below
import { Play, Send, Loader2, Code2, Download, Settings, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// --- API Configurations ---

// Piston API
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
const languageMap = {
    'python': { name: 'python', version: '3.10.0', extension: 'py', displayName: 'Python' },
    'java': { name: 'java', version: '15.0.2', extension: 'java', displayName: 'Java' },
    'cpp': { name: 'c++', version: '10.2.0', extension: 'cpp', displayName: 'C++' },
    'c': { name: 'c', version: '10.2.0', extension: 'c', displayName: 'C' }
};

// Gemini API
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";
// --- IMPORTANT: ADD YOUR GEMINI API KEY HERE ---
const API_KEY = ""; // ⚠️ Replace "" with your actual Google Generative AI API Key

// --- Helper Functions ---

/**
 * Calls the Piston API to execute code.
 */
const executeCodeWithAPI = async (lang, codeText, stdin) => {
    try {
        const langConfig = languageMap[lang];
        if (!langConfig) {
            throw new Error('Language not supported for API execution');
        }

        const response = await fetch(PISTON_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: langConfig.name,
                version: langConfig.version,
                files: [{ content: codeText }],
                stdin: stdin || ''
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }

        const result = await response.json();
        if (!result.run) {
            throw new Error("API response was successful but did not contain a 'run' object.");
        }

        // Combine stdout and stderr for a complete output
        let fullOutput = "";
        let success = true;

        if (result.run.stdout) {
            fullOutput += result.run.stdout;
        }
        if (result.run.stderr) {
            fullOutput += (fullOutput ? "\n" : "") + `[ERROR]\n${result.run.stderr}`;
            success = false;
        }

        fullOutput += `\n\n---
Program exited with code ${result.run.code}
Signal: ${result.run.signal || 'None'}`;

        return {
            success: success,
            output: fullOutput || 'Execution finished with no output.',
        };

    } catch (error) {
        console.error('API execution error:', error);
        return {
            success: false,
            output: `[EXECUTION FAILED]\n${error.message}`
        };
    }
};

/**
 * Calls the Gemini API to get code feedback.
 */
async function getCodeFeedback(codeContent, language) {
    if (!API_KEY) {
        return "Feedback unavailable: Gemini API key is missing.";
    }
    if (codeContent.trim().length < 10) {
        return "Code is too short for meaningful feedback.";
    }

    const userQuery = `Analyze the following ${language} code for quality, style, potential bugs, and suggest improvements. Be concise (3-5 bullet points). Do not comment on correctness unless there's an obvious bug. Focus on readability, conventions, and potential optimizations.\n\nCode:\n\`\`\`${language}\n${codeContent}\n\`\`\``;
    const systemPrompt = "You are a code review assistant providing constructive feedback.";

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.5,
        }
    };

    try {
        const apiUrl = `${GEMINI_API_URL}${API_KEY}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            if (errorBody?.error?.message.includes("API key not valid")) {
                throw new Error("Gemini API key not valid. Please check configuration.");
            }
            throw new Error(`Gemini API error: ${errorBody?.error?.message || 'Request failed'}`);
        }

        const data = await response.json();
        const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return feedbackText || "Could not retrieve feedback from AI.";

    } catch (e) {
        console.error("Gemini Feedback Generation failed:", e);
        return `Failed to get AI feedback: ${e.message}`;
    }
}

/**
 * Calculates a simple score based on code and execution.
 */
const calculateScore = (codeContent, executionSuccess) => {
    let score = 0;
    if (codeContent.trim().length === 0) return 0;
    score += 10; // Base score for effort
    const lines = codeContent.split('\n').length;
    score += Math.min(lines * 2, 40); // Score for length
    if (executionSuccess) { score += 50; } // Big bonus for successful run
    return Math.min(score, 100);
};


// --- Component ---

export default function CodingZonePage() {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(codeStarters?.python || '# Write your Python code here\nprint("Hello, World!")');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isExecutionSuccess, setIsExecutionSuccess] = useState(false); // Track last run
    const [showCustomInputs, setShowCustomInputs] = useState(false);
    const [customInput, setCustomInput] = useState('');

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
        setCode(codeStarters?.[newLanguage] || `// Write your ${newLanguage.toUpperCase()} code here`);
        setOutput('');
        setScore(null);
        setFeedback('');
        setIsExecutionSuccess(false);
        toast.info(`Switched to ${newLanguage.toUpperCase()}`);
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
        toast.info("Submitting code and generating feedback...");

        try {
            // 1. Get AI Feedback
            const aiFeedback = await getCodeFeedback(code, language);
            setFeedback(aiFeedback);

            // 2. Calculate Score (based on last execution)
            const calculatedScore = calculateScore(code, isExecutionSuccess);
            setScore(calculatedScore);

            // 3. Update Output Panel
            setOutput(`--- Submission Results ---
Status: Submitted
Basic Score: ${calculatedScore}/100
(Based on code length and last execution status)

--- AI Feedback ---
${aiFeedback}
`);

            toast.success('Code submitted and analyzed!');

        } catch (error) {
            toast.error(`Submission failed: ${error.message}`);
            setFeedback(`Failed to get feedback: ${error.message}`);
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
        </div>
    );
}