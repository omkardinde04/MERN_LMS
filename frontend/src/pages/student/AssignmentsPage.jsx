import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUser } from '@/utils/storage';
import { studentAPI } from '@/utils/api';
import { getSocket } from '@/utils/socket';
import { FileText, Upload, CheckCircle2, Clock, Eye, Download as DownloadIcon, X, FileCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState({ pending: [], submitted: [] });
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [previewAssignment, setPreviewAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = getUser();

    // Load assignments from backend
    const loadAssignments = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getAssignments();
            if (response.success) {
                setAssignments({
                    pending: response.data.pending || [],
                    submitted: response.data.submitted || []
                });
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssignments();

        // Setup Socket.io for real-time updates
        try {
            const socket = getSocket(user?.token);

            // Join student room
            if (socket && user?.id) {
                socket.emit('join-student-room', user.id);
            }

            // Listen for assignment graded event
            const handleAssignmentGraded = (data) => {
                console.log('Assignment graded event received:', data);
                toast.success('Your assignment has been graded!');

                // Reload assignments to show updated grades
                loadAssignments();
            };

            if (socket) {
                socket.on('assignment-graded', handleAssignmentGraded);
            }

            return () => {
                if (socket) {
                    socket.off('assignment-graded', handleAssignmentGraded);
                }
            };
        } catch (error) {
            console.error('Socket.io error:', error);
            // Continue without socket - not critical for basic functionality
        }
    }, [user]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!selectedAssignment || !file) {
            toast.error('Please select an assignment and upload a file');
            return;
        }

        try {
            // Convert file to base64 or upload to server first
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    // For now, use data URL. In production, upload to S3/cloud storage
                    const fileData = reader.result;
                    const response = await studentAPI.submitAssignment(
                        selectedAssignment.id,
                        fileData,
                        file.name
                    );

                    if (response.success) {
                        toast.success('Assignment submitted successfully!');
                        setUploadDialogOpen(false);
                        setSelectedAssignment(null);
                        setFile(null);
                        loadAssignments(); // Reload to show updated status
                    }
                } catch (error) {
                    toast.error(error.message || 'Failed to submit assignment');
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error('Failed to submit assignment');
        }
    };

    const openUploadDialog = (assignment = null) => {
        setSelectedAssignment(assignment);
        setUploadDialogOpen(true);
    };


    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Assignments</h1>
                        <p className="text-muted-foreground mt-1">Loading assignments...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Assignments</h1>
                    <p className="text-muted-foreground mt-1">Track and submit your assignments</p>
                </div>
                <Button onClick={() => openUploadDialog()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Assignment
                </Button>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="pending">
                        <Clock className="h-4 w-4 mr-2" />
                        Pending ({assignments.pending.length})
                    </TabsTrigger>
                    <TabsTrigger value="submitted">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submitted ({assignments.submitted.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {assignments.pending.length > 0 ? (
                        assignments.pending.map((assignment, index) => (
                            <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-orange-500" />
                                                    {assignment.title}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {assignment.courseName}
                                                </CardDescription>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Max Score: {assignment.maxScore}</span>
                                            <Button onClick={() => openUploadDialog(assignment)}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Submission
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No pending assignments</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="submitted" className="space-y-4">
                    {assignments.submitted.length > 0 ? (
                        assignments.submitted.map((assignment, index) => (
                            <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    {assignment.title}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {assignment.courseName}
                                                </CardDescription>
                                            </div>
                                            <div className="text-right">
                                                {assignment.score ? (
                                                    <div className="px-3 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                        <p className="text-sm font-bold">{assignment.score}/{assignment.maxScore}</p>
                                                    </div>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        Awaiting Grade
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{assignment.description}</p>

                                        {assignment.submittedFile && (
                                            <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <span className="text-sm font-medium">{assignment.submittedFile.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({(assignment.submittedFile.size / 1024).toFixed(2)} KB)
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setPreviewAssignment(assignment)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {assignment.submittedFile.data && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const link = document.createElement('a');
                                                                    link.href = assignment.submittedFile.data;
                                                                    link.download = assignment.submittedFile.name;
                                                                    link.click();
                                                                }}
                                                            >
                                                                <DownloadIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Feedback Section */}
                                        {assignment.feedback && (
                                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Feedback:</p>
                                                <p className="text-sm text-blue-900 dark:text-blue-200">{assignment.feedback}</p>
                                            </div>
                                        )}

                                        {/* Plagiarism Report Section */}
                                        {assignment.plagiarismReport && (
                                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">Plagiarism Report:</p>
                                                    </div>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded ${assignment.plagiarismReport.similarity > 25 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                                                        Similarity: {assignment.plagiarismReport.similarity}%
                                                    </span>
                                                </div>
                                                {assignment.plagiarismReport.sources && assignment.plagiarismReport.sources.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Sources Found:</p>
                                                        {assignment.plagiarismReport.sources.map((source, idx) => (
                                                            <div key={idx} className="flex justify-between text-xs text-orange-900 dark:text-orange-200">
                                                                <span>{source.name}</span>
                                                                <span>{source.similarity}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {assignment.plagiarismReportUrl && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="mt-2 w-full"
                                                        onClick={() => window.open(assignment.plagiarismReportUrl, '_blank')}
                                                    >
                                                        <FileCheck className="h-3 w-3 mr-1" />
                                                        View Full Report
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Submitted on: {new Date(assignment.submittedAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No submitted assignments yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent onClose={() => setUploadDialogOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Submit Assignment</DialogTitle>
                        <DialogDescription>
                            Upload your assignment file to submit
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {!selectedAssignment && (
                            <div className="space-y-2">
                                <Label>Select Assignment</Label>
                                <Select onValueChange={(value) => {
                                    const assignment = assignments.pending.find(a => String(a.id) === String(value));
                                    setSelectedAssignment(assignment);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an assignment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignments.pending.map(assignment => (
                                            <SelectItem key={assignment.id} value={String(assignment.id)}>
                                                {assignment.title} - {assignment.courseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {selectedAssignment && (
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold">{selectedAssignment.title}</h4>
                                <p className="text-sm text-muted-foreground">{selectedAssignment.courseName}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="file">Upload File</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.zip"
                            />
                        </div>
                        <Button className="w-full" onClick={handleSubmit}>
                            Submit Assignment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            {previewAssignment && previewAssignment.submittedFile && (
                <Dialog open={!!previewAssignment} onOpenChange={() => setPreviewAssignment(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>Preview: {previewAssignment.submittedFile.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPreviewAssignment(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </DialogTitle>
                            <DialogDescription>
                                {previewAssignment.title} - {previewAssignment.courseName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 max-h-[60vh] overflow-auto">
                            {previewAssignment.submittedFile.type?.startsWith('image/') ? (
                                <img
                                    src={previewAssignment.submittedFile.data}
                                    alt={previewAssignment.submittedFile.name}
                                    className="w-full rounded-lg"
                                />
                            ) : previewAssignment.submittedFile.type === 'application/pdf' ? (
                                <iframe
                                    src={previewAssignment.submittedFile.data}
                                    className="w-full h-[60vh] rounded-lg border"
                                    title={previewAssignment.submittedFile.name}
                                />
                            ) : (
                                <div className="p-8 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4">
                                        Preview not available for this file type
                                    </p>
                                    <Button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = previewAssignment.submittedFile.data;
                                            link.download = previewAssignment.submittedFile.name;
                                            link.click();
                                        }}
                                    >
                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                        Download File
                                    </Button>
                                </div>
                            )}
                        </div>

                        {previewAssignment && previewAssignment.plagiarismReport && (
                            <Card className="mb-4 bg-muted/30">
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Plagiarism Report</p>
                                            <p className="text-xs text-muted-foreground">Similarity: {previewAssignment.plagiarismReport.similarity}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Reported: {previewAssignment.plagiarismReportedAt ? new Date(previewAssignment.plagiarismReportedAt).toLocaleString() : '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs space-y-1">
                                        {previewAssignment.plagiarismReport.sources?.map((s, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span>{s.name}</span>
                                                <span className="text-muted-foreground">{s.similarity}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
