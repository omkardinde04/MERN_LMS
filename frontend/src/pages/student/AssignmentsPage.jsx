import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLocalData, setLocalData } from '@/utils/storage';
import { FileText, Upload, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState(getLocalData('assignments', []));
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);

    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    const submittedAssignments = assignments.filter(a => a.status === 'submitted');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = () => {
        if (!selectedAssignment || !file) {
            toast.error('Please select an assignment and upload a file');
            return;
        }

        const updatedAssignments = assignments.map(a =>
            a.id === selectedAssignment.id
                ? { ...a, status: 'submitted', submittedAt: new Date().toISOString().split('T')[0] }
                : a
        );

        setAssignments(updatedAssignments);
        setLocalData('assignments', updatedAssignments);

        toast.success('Assignment submitted successfully!');
        setUploadDialogOpen(false);
        setSelectedAssignment(null);
        setFile(null);
    };

    const openUploadDialog = (assignment = null) => {
        setSelectedAssignment(assignment);
        setUploadDialogOpen(true);
    };

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
                        Pending ({pendingAssignments.length})
                    </TabsTrigger>
                    <TabsTrigger value="submitted">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submitted ({submittedAssignments.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingAssignments.length > 0 ? (
                        pendingAssignments.map((assignment, index) => (
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
                    {submittedAssignments.length > 0 ? (
                        submittedAssignments.map((assignment, index) => (
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
                                    const assignment = pendingAssignments.find(a => a.id === parseInt(value));
                                    setSelectedAssignment(assignment);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an assignment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pendingAssignments.map(assignment => (
                                            <SelectItem key={assignment.id} value={assignment.id.toString()}>
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
        </div>
    );
}
