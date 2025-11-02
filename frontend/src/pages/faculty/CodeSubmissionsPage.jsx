import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Trash2, Download, Search, Calendar, FileCode, User } from 'lucide-react';
import { getLocalData } from '@/utils/storage';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CodeSubmissionsPage() {
    const submissions = getLocalData('submissions', []);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRunOpen, setIsRunOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter submissions based on search term
    const filteredSubmissions = submissions.filter(submission => 
        submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        toast.success('Submission deleted successfully');
        // In a real app, this would delete from the backend
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
                    {filteredSubmissions.length > 0 ? (
                        <div className="space-y-3">
                            {filteredSubmissions.map((submission, index) => (
                                <motion.div 
                                    key={submission.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-semibold">{submission.studentName}</p>
                                            </div>
                                            <Badge className={`border ${getLanguageBadge(submission.language)}`}>
                                                {submission.language?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{submission.courseName}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <FileCode className="h-3 w-3" />
                                                <span className="font-mono">{submission.fileName}</span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
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
                            {selectedSubmission?.studentName} - {selectedSubmission?.fileName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{selectedSubmission?.fileName}</p>
                                <p className="text-sm text-muted-foreground">{selectedSubmission?.courseName}</p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                        </div>
                        <ScrollArea className="h-[500px] border rounded-lg bg-slate-950">
                            <pre className="p-4 text-sm font-mono text-slate-100">
                                <code>{selectedSubmission?.codeContent || '// Code content would be displayed here'}</code>
                            </pre>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Run Dialog */}
            <Dialog open={isRunOpen} onOpenChange={setIsRunOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Code Execution</DialogTitle>
                        <DialogDescription>
                            Running {selectedSubmission?.fileName} by {selectedSubmission?.studentName}
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