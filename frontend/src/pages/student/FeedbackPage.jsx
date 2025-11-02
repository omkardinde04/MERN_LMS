import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getLocalData, setLocalData } from '@/utils/storage';
import { MessageSquare, Trash2, Star, Upload, FileText, X, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FeedbackPage() {
    const courses = getLocalData('courses', []);
    const [feedbackList, setFeedbackList] = useState(getLocalData('feedback', []));
    const [selectedCourse, setSelectedCourse] = useState('');
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState(null);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            
            // Create a file reader to get base64 data for preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile({
                    file: file,
                    preview: reader.result,
                    type: file.type
                });
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCourse || !rating || !comment) {
            toast.error('Please fill in all required fields');
            return;
        }

        const course = courses.find(c => c.id === selectedCourse);
        const newFeedback = {
            id: Date.now(),
            courseId: selectedCourse,
            courseName: course.name,
            rating: parseInt(rating),
            comment,
            fileName: selectedFile ? fileName : null,
            fileSize: selectedFile ? (selectedFile.file.size / 1024).toFixed(2) + ' KB' : null,
            filePreview: selectedFile ? selectedFile.preview : null,
            fileType: selectedFile ? selectedFile.type : null,
            date: new Date().toISOString().split('T')[0],
        };

        const updated = [...feedbackList, newFeedback];
        setFeedbackList(updated);
        setLocalData('feedback', updated);

        setSelectedCourse('');
        setRating('');
        setComment('');
        setSelectedFile(null);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.success('Feedback submitted successfully!');
    };

    const handleDelete = (id) => {
        const updated = feedbackList.filter(f => f.id !== id);
        setFeedbackList(updated);
        setLocalData('feedback', updated);
        toast.success('Feedback deleted');
        setDeleteDialogOpen(false);
        setFeedbackToDelete(null);
    };

    const openDeleteDialog = (feedback) => {
        setFeedbackToDelete(feedback);
        setDeleteDialogOpen(true);
    };

    const handleDownload = (feedback) => {
        if (!feedback.filePreview || !feedback.fileName) {
            toast.error('No file available to download');
            return;
        }

        try {
            // Convert base64 to blob
            const link = document.createElement('a');
            link.href = feedback.filePreview;
            link.download = feedback.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('File downloaded successfully');
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const handlePreview = (feedback) => {
        if (!feedback.filePreview) {
            toast.error('No preview available');
            return;
        }
        setPreviewData(feedback);
        setPreviewDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Feedback</h1>
                <p className="text-muted-foreground mt-1">Share your thoughts about your courses</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submit Feedback */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Submit Feedback
                            </CardTitle>
                            <CardDescription>Help us improve your learning experience</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Course</Label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <Select value={rating} onValueChange={setRating}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Rate your experience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[5, 4, 3, 2, 1].map(r => (
                                                <SelectItem key={r} value={r.toString()}>
                                                    {'★'.repeat(r) + '☆'.repeat(5 - r)} ({r} stars)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Your Feedback *</Label>
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your thoughts about the course, teaching methodology, assignments, etc."
                                        className="min-h-[150px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Upload File (Optional)</Label>
                                    {!selectedFile ? (
                                        <div>
                                            <Button 
                                                variant="outline" 
                                                type="button" 
                                                className="w-full justify-center"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Choose File
                                            </Button>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-medium truncate">{fileName}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleRemoveFile}
                                                    className="h-8 w-8"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {/* Show preview for images */}
                                            {selectedFile && selectedFile.type?.startsWith('image/') && (
                                                <div className="relative rounded-lg overflow-hidden border border-border">
                                                    <img 
                                                        src={selectedFile.preview} 
                                                        alt={fileName}
                                                        className="w-full h-auto max-h-48 object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 5MB)
                                    </p>
                                </div>

                                <Button type="submit" className="w-full">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Submit Feedback
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Previous Feedback */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Feedback History</CardTitle>
                            <CardDescription>{feedbackList.length} feedback submitted</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                            {feedbackList.length > 0 ? (
                                feedbackList.map(feedback => (
                                    <div key={feedback.id} className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium">{feedback.courseName}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < feedback.rating
                                                                ? 'fill-primary text-primary'
                                                                : 'text-muted-foreground'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteDialog(feedback)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                                        {feedback.fileName && (
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <span className="text-xs font-medium">{feedback.fileName}</span>
                                                        {feedback.fileSize && (
                                                            <span className="text-xs text-muted-foreground">({feedback.fileSize})</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {feedback.filePreview && (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => handlePreview(feedback)}
                                                                >
                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                    Preview
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => handleDownload(feedback)}
                                                                >
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    Download
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {feedback.filePreview && feedback.fileType?.startsWith('image/') && (
                                                    <div className="relative rounded-lg overflow-hidden border border-border">
                                                        <img 
                                                            src={feedback.filePreview} 
                                                            alt={feedback.fileName}
                                                            className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => handlePreview(feedback)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(feedback.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-12">
                                    No feedback submitted yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this feedback? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(feedbackToDelete?.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Preview Dialog */}
            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>File Preview</DialogTitle>
                        <DialogDescription>
                            {previewData?.fileName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>{previewData?.fileName}</span>
                                {previewData?.fileSize && (
                                    <span>({previewData.fileSize})</span>
                                )}
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(previewData)}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                        </div>
                        <div className="border rounded-lg overflow-hidden bg-muted/30">
                            {previewData?.fileType?.startsWith('image/') ? (
                                <img 
                                    src={previewData.filePreview} 
                                    alt={previewData.fileName}
                                    className="w-full h-auto max-h-[600px] object-contain"
                                />
                            ) : (
                                <div className="p-12 text-center">
                                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Preview not available for this file type
                                    </p>
                                    <Button onClick={() => handleDownload(previewData)}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
