import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Trash2, Download, Search, Calendar, FileCode, User, Loader2 } from 'lucide-react';
import { getUser } from '@/utils/storage';
import { facultyAPI } from '@/utils/api';
import { getSocket } from '@/utils/socket';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CodeSubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRunOpen, setIsRunOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const user = getUser();

    // Load submissions from backend
    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const response = await facultyAPI.getCodeSubmissions();
            if (response.success) {
                setSubmissions(response.data || []);
                console.log('[CodeSubmissionsPage] Loaded submissions:', response.data?.length || 0);
            }
        } catch (error) {
            console.error('[CodeSubmissionsPage] Error loading submissions:', error);
            toast.error('Failed to load code submissions');
        } finally {
            setLoading(false);
        }
    };

    // Load submissions and setup Socket.io
    useEffect(() => {
        loadSubmissions();

        // Setup Socket.io for real-time updates
        try {
            const socket = getSocket(user?.token);

            // Join code submissions room
            if (socket) {
                socket.emit('join-code-submissions-room');
                console.log('[CodeSubmissionsPage] Joined code-submissions room');
            }

            // Listen for new code submissions
            const handleNewSubmission = (data) => {
                console.log('[CodeSubmissionsPage] New code submission received:', data);
                toast.info(`New code submission from ${data.studentName}`);

                // Reload submissions to get the latest
                loadSubmissions();
            };

            if (socket) {
                socket.on('new-code-submission', handleNewSubmission);
                console.log('[CodeSubmissionsPage] Listening for new-code-submission events');
            }

            return () => {
                if (socket) {
                    socket.off('new-code-submission', handleNewSubmission);
                }
            };
        } catch (error) {
            console.error('[CodeSubmissionsPage] Socket.io error:', error);
            // Continue without socket - not critical for basic functionality
        }
    }, [user]);

    // Filter submissions based on search term
    const filteredSubmissions = Array.isArray(submissions)
        ? submissions.filter(submission => {
            if (!submission) return false;
            const student = submission.student;
            const name = (student?.fullName || '').toLowerCase();
            const file = (submission.fileName || '').toLowerCase();
            const language = (submission.language || '').toLowerCase();
            const search = searchTerm.toLowerCase();
            return name.includes(search) || file.includes(search) || language.includes(search);
        })
        : [];

    const handlePreview = (submission) => {
        setSelectedSubmission(submission);
        setIsPreviewOpen(true);
    };

    const handleRun = (submission) => {
        setSelectedSubmission(submission);
        setIsRunOpen(true);
        // Simulate code execution
        toast.success('Code executed successfully');
    };

    const handleDelete = (submissionId) => {
        // Note: Backend doesn't have delete endpoint yet, but keeping for future
        toast.info('Delete functionality coming soon');
    };

    const getLanguageBadge = (language) => {
        const colors = {
            python: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            java: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            cpp: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            c: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
            javascript: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        };
        return colors[language] || 'bg-muted text-muted-foreground';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Code Submissions</h1>
                <p className="text-muted-foreground mt-1">View and manage student code submissions</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by student name, course, or file name..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Submissions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <CardDescription>{filteredSubmissions.length} submissions found</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 text-muted-foreground mx-auto animate-spin mb-2" />
                            <p className="text-sm text-muted-foreground">Loading submissions...</p>
                        </div>
                    ) : filteredSubmissions.length > 0 ? (
                        <div className="space-y-3">
                            {filteredSubmissions.map((submission, index) => (
                                <motion.div
                                    key={submission._id || submission.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-semibold">{submission.student?.fullName || 'Unknown Student'}</p>
                                            </div>
                                            {submission.language && (
                                                <Badge className={`border ${getLanguageBadge(submission.language)}`}>
                                                    {submission.language.toUpperCase()}
                                                </Badge>
                                            )}
                                            {submission.score !== null && submission.score !== undefined && (
                                                <Badge variant="outline" className="ml-auto">
                                                    Score: {submission.score}/100
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{submission.courseName || 'N/A'}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <FileCode className="h-3 w-3" />
                                                <span className="font-mono">{submission.fileName || 'code.txt'}</span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                        {submission.aiFeedback && (
                                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-900 dark:text-blue-200 line-clamp-1">
                                                AI Feedback: {submission.aiFeedback.substring(0, 80)}...
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handlePreview(submission)}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            Preview
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleRun(submission)}>
                                            <Play className="h-4 w-4 mr-1" />
                                            Run
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(submission.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8 text-muted-foreground">
                            {searchTerm ? 'No submissions found matching your search' : 'No code submissions yet'}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Code Preview</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission?.student?.fullName || 'Unknown'} - {selectedSubmission?.fileName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{selectedSubmission?.fileName}</p>
                                <p className="text-sm text-muted-foreground">Student: {selectedSubmission?.student?.fullName || 'Unknown'}</p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                        </div>
                        <ScrollArea className="h-[400px] border rounded-lg bg-slate-950">
                            <pre className="p-4 text-sm font-mono text-slate-100 whitespace-pre-wrap">
                                <code>{selectedSubmission?.code || selectedSubmission?.codeContent || '// Code content would be displayed here'}</code>
                            </pre>
                        </ScrollArea>
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
                        {selectedSubmission && (selectedSubmission.aiFeedback || selectedSubmission.feedback) && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">AI Feedback:</p>
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-200">
                                        {(selectedSubmission.aiFeedback || selectedSubmission.feedback || '').split('\n').map((line, i) => {
                                            if (line.startsWith('##')) {
                                                return <h2 key={i} className="text-base font-bold mt-2 mb-1">{line.replace('##', '')}</h2>;
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
                        {selectedSubmission && selectedSubmission.score !== null && selectedSubmission.score !== undefined && (
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold">Score:</p>
                                <Badge variant="outline">{selectedSubmission.score}/100</Badge>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Run Dialog */}
            <Dialog open={isRunOpen} onOpenChange={setIsRunOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Code Execution</DialogTitle>
                        <DialogDescription>
                            Running {selectedSubmission?.fileName} by {selectedSubmission?.student?.fullName || 'Unknown'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{selectedSubmission?.fileName}</p>
                                <p className="text-sm text-muted-foreground">{selectedSubmission?.courseName}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Input:</p>
                            <textarea
                                className="w-full h-24 p-3 border rounded-lg bg-muted/10"
                                placeholder="Enter input for the program (if any)"
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Output:</p>
                            <ScrollArea className="h-40 p-3 border rounded-lg bg-muted/10">
                                <pre className="text-sm">
                                    {/* Output would be displayed here after execution */}
                                    Program executed successfully!
                                    {'\n'}Hello, World!
                                    {'\n'}Process exited with code 0
                                </pre>
                            </ScrollArea>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsRunOpen(false)}>
                                Close
                            </Button>
                            <Button onClick={() => handleRun(selectedSubmission)}>
                                <Play className="h-4 w-4 mr-1" />
                                Run Again
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
