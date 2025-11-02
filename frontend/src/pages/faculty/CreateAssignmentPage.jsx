import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Plus, X } from 'lucide-react';
import { getLocalData, setLocalData } from '@/utils/storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function CreateAssignmentPage() {
    const navigate = useNavigate();
    const courses = getLocalData('courses', []);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        file: null,
    });
    const [filePreview, setFilePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size exceeds 2MB limit');
                return;
            }
            
            setFormData({ ...formData, file });
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const removeFile = () => {
        setFormData({ ...formData, file: null });
        setFilePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.title || !formData.description || !formData.courseId || !formData.dueDate) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        // Create assignment object
        const newAssignment = {
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            courseId: formData.courseId,
            courseName: courses.find(c => c.id === formData.courseId)?.name || '',
            dueDate: formData.dueDate,
            fileName: formData.file?.name || null,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        
        // Get existing assignments
        const assignments = getLocalData('assignments', []);
        
        // Add new assignment
        const updatedAssignments = [...assignments, newAssignment];
        setLocalData('assignments', updatedAssignments);
        
        // Show success message
        toast.success('Assignment created successfully!');
        
        // Reset form
        setFormData({
            title: '',
            description: '',
            courseId: '',
            dueDate: '',
            file: null,
        });
        setFilePreview(null);
        
        // Navigate back to assignments page or courses page
        navigate('/faculty/courses');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create Assignment</h1>
                <p className="text-muted-foreground mt-1">Create a new assignment for your students</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                    <CardDescription>Fill in the details for your new assignment</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Data Structures Homework 1"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the assignment requirements..."
                                rows={4}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="courseId">Course *</Label>
                            <Select
                                value={formData.courseId}
                                onValueChange={(value) => handleSelectChange('courseId', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
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

                        <div>
                            <Label htmlFor="dueDate">Due Date *</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="file">Upload File (Optional)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.zip"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('file').click()}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Choose File
                                </Button>
                                {formData.file && (
                                    <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                                        <span className="text-sm truncate max-w-[150px]">{formData.file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={removeFile}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {filePreview && (
                                <div className="mt-2">
                                    <p className="text-sm text-muted-foreground">File preview:</p>
                                    <div className="border rounded-lg p-2 mt-1">
                                        <p className="text-sm">{formData.file.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/faculty/courses')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Assignment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}