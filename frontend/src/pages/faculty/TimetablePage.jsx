import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getLocalData, setLocalData } from '@/utils/storage';
import { Plus, Edit, Trash2, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
];

export default function TimetablePage() {
    const [timetable, setTimetable] = useState(getLocalData('timetable', []));
    const [courses] = useState(getLocalData('courses', []));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dayFilter, setDayFilter] = useState('All Days');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [formData, setFormData] = useState({
        courseName: '',
        courseCode: '',
        day: '',
        time: '',
        room: '',
        type: 'Lecture',
        class: '',
    });

    // Group timetable by type
    const groupedTimetable = useMemo(() => {
        let filtered = timetable;

        // Apply filters
        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.room?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.day?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (dayFilter !== 'All Days') {
            filtered = filtered.filter(item => item.day === dayFilter);
        }

        if (typeFilter !== 'All Types') {
            filtered = filtered.filter(item => item.type === typeFilter);
        }

        // Group by type
        const groups = {
            Lecture: [],
            Lab: [],
            Practical: []
        };

        filtered.forEach(item => {
            const type = item.type || 'Lecture';
            if (type === 'Tutorial') {
                groups.Practical.push(item);
            } else if (groups[type]) {
                groups[type].push(item);
            }
        });

        return groups;
    }, [timetable, searchQuery, dayFilter, typeFilter]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'Lecture':
                return 'bg-yellow-500';
            case 'Lab':
                return 'bg-blue-500';
            case 'Practical':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingSlot) {
            const updatedTimetable = timetable.map(slot =>
                slot.id === editingSlot.id ? { ...slot, ...formData } : slot
            );
            setTimetable(updatedTimetable);
            setLocalData('timetable', updatedTimetable);
            toast.success('Class schedule updated');
        } else {
            const newSlot = {
                id: Date.now(),
                ...formData,
            };
            const updatedTimetable = [...timetable, newSlot];
            setTimetable(updatedTimetable);
            setLocalData('timetable', updatedTimetable);
            toast.success('Class scheduled successfully');
        }

        setIsDialogOpen(false);
        setEditingSlot(null);
        setFormData({ courseName: '', courseCode: '', day: '', time: '', room: '', type: 'Lecture', class: '' });
    };

    const handleEdit = (slot) => {
        setEditingSlot(slot);
        setFormData({
            courseName: slot.courseName,
            courseCode: slot.courseCode || '',
            day: slot.day,
            time: slot.time,
            room: slot.room,
            type: slot.type,
            class: slot.class || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (slotId) => {
        const updatedTimetable = timetable.filter(slot => slot.id !== slotId);
        setTimetable(updatedTimetable);
        setLocalData('timetable', updatedTimetable);
        toast.success('Class removed from schedule');
        setDeleteDialogOpen(false);
        setSlotToDelete(null);
    };

    const openDeleteDialog = (slot) => {
        setSlotToDelete(slot);
        setDeleteDialogOpen(true);
    };

    const getClassesForDayAndTime = (day, time) => {
        return timetable.filter(slot => slot.day === day && slot.time === time);
    };

    const renderTypeSection = (type, items) => {
        if (items.length === 0) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                    <h2 className="text-xl font-bold">
                        {type}s ({items.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Day</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items
                                .sort((a, b) => {
                                    const dayOrder = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
                                    if (dayOrder !== 0) return dayOrder;
                                    return a.time.localeCompare(b.time);
                                })
                                .map((item, index) => (
                                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-foreground">{item.day}</td>
                                        <td className="py-3 px-4 text-sm text-foreground">{item.time}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-foreground">{item.courseName}</td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">{item.room}</td>
                                        <td className="py-3 px-4 text-sm text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(item)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Timetable</h1>
                    <p className="text-muted-foreground mt-1">Manage your weekly class schedule</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingSlot(null);
                            setFormData({ courseName: '', courseCode: '', day: '', time: '', room: '', type: 'Lecture', class: '' });
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSlot ? 'Edit Class' : 'Schedule New Class'}</DialogTitle>
                            <DialogDescription>
                                {editingSlot ? 'Update class schedule' : 'Add a new class to your timetable'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="courseName">Course Name</Label>
                                <Input
                                    id="courseName"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Data Structures"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="courseCode">Course Code</Label>
                                <Input
                                    id="courseCode"
                                    name="courseCode"
                                    value={formData.courseCode}
                                    onChange={handleInputChange}
                                    placeholder="e.g., CS201"
                                />
                            </div>
                            <div>
                                <Label htmlFor="day">Day</Label>
                                <Select value={formData.day} onValueChange={(value) => handleSelectChange('day', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS.map(day => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="time">Time Slot</Label>
                                <Select value={formData.time} onValueChange={(value) => handleSelectChange('time', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_SLOTS.map(slot => (
                                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="room">Room</Label>
                                <Input
                                    id="room"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Room 301"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="type">Type</Label>
                                <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lecture">Lecture</SelectItem>
                                        <SelectItem value="Lab">Lab</SelectItem>
                                        <SelectItem value="Practical">Practical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="class">Class/Section</Label>
                                <Input
                                    id="class"
                                    name="class"
                                    value={formData.class}
                                    onChange={handleInputChange}
                                    placeholder="e.g., A1"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingSlot ? 'Update' : 'Schedule'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search subject, room, day"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={dayFilter} onValueChange={setDayFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Days">All Days</SelectItem>
                        {DAYS.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Types">All Types</SelectItem>
                        <SelectItem value="Lecture">Lectures</SelectItem>
                        <SelectItem value="Lab">Labs</SelectItem>
                        <SelectItem value="Practical">Practicals</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Grouped Sections */}
            <div className="space-y-8">
                {renderTypeSection('Lecture', groupedTimetable.Lecture)}
                {renderTypeSection('Lab', groupedTimetable.Lab)}
                {renderTypeSection('Practical', groupedTimetable.Practical)}
            </div>

            {timetable.length === 0 && (
                <Card className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No classes scheduled</h3>
                    <p className="text-muted-foreground mb-4">
                        Start by adding your first class to the timetable
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Your First Class
                    </Button>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Class</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove "{slotToDelete?.courseName}" from the timetable? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(slotToDelete?.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
