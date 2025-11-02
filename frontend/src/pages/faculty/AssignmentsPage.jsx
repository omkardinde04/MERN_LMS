import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getLocalData, setLocalData } from '@/utils/storage';
import { Plus, Eye, Download, CheckCircle, XCircle, Calendar, Users, FileText, Send, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AssignmentsPage() {
    const assignments = getLocalData('facultyAssignments', []);
    const assignmentSubmissions = getLocalData('assignmentSubmissions', {});
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
    const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isPlagiarismChecking, setIsPlagiarismChecking] = useState(false);
    const [plagiarismReport, setPlagiarismReport] = useState(null);

    const handleViewSubmissions = (assignment) => {
        setSelectedAssignment(assignment);
        setIsSubmissionsDialogOpen(true);
    };

    const handlePreview = (submission) => {
        setSelectedSubmission(submission);
        setPlagiarismReport(null); // Reset plagiarism report
        setIsPreviewDialogOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewDialogOpen(false);
        setPlagiarismReport(null);
        setSelectedSubmission(null);
    };

    const handleCloseGrading = () => {
        setIsGradingDialogOpen(false);
        setMarks('');
        setFeedback('');
        setSelectedSubmission(null);
    };

    const handleCloseSubmissions = () => {
        setIsSubmissionsDialogOpen(false);
        setSelectedAssignment(null);
    };

    const handleDownload = (submission) => {
        // Simulate file download
        const blob = new Blob([submission.content || 'Assignment content'], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.fileName || 'submission.pdf';
        a.click();
        toast.success('File downloaded successfully');
    };

    const handlePlagiarismCheck = async (submission) => {
        setIsPlagiarismChecking(true);
        setPlagiarismReport(null);
        
        // Simulate API call to plagiarism checker
        setTimeout(() => {
            const mockReport = {
                similarity: Math.floor(Math.random() * 30) + 5, // 5-35%
                sources: [
                    { name: 'Wikipedia - Network Protocols', similarity: 12 },
                    { name: 'GeeksforGeeks - TCP/IP', similarity: 8 },
                    { name: 'Previous Submission 2024', similarity: 6 }
                ],
                status: 'completed'
            };
            setPlagiarismReport(mockReport);
            setIsPlagiarismChecking(false);
            toast.success('Plagiarism check completed');
        }, 2000);
    };

    const handleGrade = (submission) => {
        setSelectedSubmission(submission);
        setMarks(submission.marks || '');
        setFeedback(submission.feedback || '');
        setIsGradingDialogOpen(true);
    };

    const handleSubmitGrade = () => {
        if (!marks) {
            toast.error('Please enter marks');
            return;
        }

        // Update submission with marks and feedback
        const gradeMessage = `Marks (${marks}/100) sent to ${selectedSubmission.studentName}`;
        toast.success(gradeMessage);
        handleCloseGrading();
    };

    const handleSendPlagiarismReport = () => {
        if (!plagiarismReport) {
            toast.error('Please run plagiarism check first');
            return;
        }

        toast.success(`Plagiarism report (${plagiarismReport.similarity}% similarity) sent to ${selectedSubmission.studentName}`);
        handleClosePreview();
    };

    const getSubmissionStats = (assignmentId) => {
        const submissions = assignmentSubmissions[assignmentId] || [];
        const submitted = submissions.length;
        const totalStudents = 45; // This should come from course enrollment
        const pending = totalStudents - submitted;
        const percentage = totalStudents > 0 ? (submitted / totalStudents) * 100 : 0;
        
        return { submitted, pending, totalStudents, percentage };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Assignments</h1>
                    <p className="text-muted-foreground mt-1">Manage and grade student assignments</p>
                </div>
                <Button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload New Assignment
                </Button>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
                {assignments.length > 0 ? (
                    assignments.map((assignment, index) => {
                        const stats = getSubmissionStats(assignment.id);
                        
                        return (
                            <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-card hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold mb-1">{assignment.title}</h3>
                                                <p className="text-sm text-muted-foreground">{assignment.course}</p>
                                            </div>
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewSubmissions(assignment)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Submissions
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{stats.submitted}/{stats.totalStudents} submitted</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span>{stats.pending} pending</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{Math.round(stats.percentage)}% Complete</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-yellow-500 transition-all duration-500"
                                                    style={{ width: `${stats.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                ) : (
                    <Card className="p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first assignment to get started</p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Assignment
                        </Button>
                    </Card>
                )}
            </div>

            {/* Submissions Dialog */}
            <Dialog open={isSubmissionsDialogOpen} onOpenChange={(open) => !open && handleCloseSubmissions()}>
                <DialogContent className="max-w-5xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>{selectedAssignment?.title} - Submissions</DialogTitle>
                        <DialogDescription>
                            {selectedAssignment?.course} • Due: {selectedAssignment && new Date(selectedAssignment.dueDate).toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[600px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(assignmentSubmissions[selectedAssignment?.id] || []).map((submission, index) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{submission.studentName}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(submission.submittedAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-mono">{submission.fileName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {submission.marks ? (
                                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                                    Graded: {submission.marks}/100
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Pending Review</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handlePreview(submission)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Preview
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleDownload(submission)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="default"
                                                    onClick={() => handleGrade(submission)}
                                                >
                                                    Grade
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewDialogOpen} onOpenChange={(open) => !open && handleClosePreview()}>
                <DialogContent className="max-w-4xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>Assignment Preview</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission?.studentName} • {selectedSubmission?.fileName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Submitted: {selectedSubmission && new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownload(selectedSubmission)}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePlagiarismCheck(selectedSubmission)}
                                    disabled={isPlagiarismChecking}
                                >
                                    <FileCheck className="h-4 w-4 mr-1" />
                                    {isPlagiarismChecking ? 'Checking...' : 'Check Plagiarism'}
                                </Button>
                            </div>
                        </div>

                        {/* Plagiarism Report */}
                        {plagiarismReport && (
                            <Card className="bg-muted/30">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileCheck className="h-4 w-4" />
                                            Plagiarism Report
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={handleSendPlagiarismReport}
                                        >
                                            <Send className="h-3 w-3 mr-1" />
                                            Send Report
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Similarity Score:</span>
                                        <Badge className={plagiarismReport.similarity > 25 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}>
                                            {plagiarismReport.similarity}%
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Sources Found:</p>
                                        {plagiarismReport.sources.map((source, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs">
                                                <span>{source.name}</span>
                                                <span className="text-muted-foreground">{source.similarity}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Document Preview */}
                        <ScrollArea className="h-[400px] border rounded-lg bg-slate-50 dark:bg-slate-950">
                            <div className="p-6">
                                <pre className="text-sm whitespace-pre-wrap font-sans">
                                    {selectedSubmission?.content || `Network Protocol Analysis
Assignment Submission

Student: ${selectedSubmission?.studentName}

Introduction:
This analysis covers the fundamental aspects of network protocols including TCP/IP, HTTP, and UDP...

[Document preview would be displayed here]`}
                                </pre>
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Grading Dialog */}
            <Dialog open={isGradingDialogOpen} onOpenChange={(open) => !open && handleCloseGrading()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Grade Assignment</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission?.studentName} • {selectedSubmission?.fileName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="marks">Marks (out of 100)</Label>
                            <Input
                                id="marks"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Enter marks"
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Feedback (Optional)</Label>
                            <Textarea
                                id="feedback"
                                placeholder="Add feedback for the student..."
                                rows={4}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="outline" onClick={handleCloseGrading}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitGrade}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Marks
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Assignment Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                        <DialogDescription>Upload a new assignment for students</DialogDescription>
                    </DialogHeader>
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Assignment creation form would be here</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
