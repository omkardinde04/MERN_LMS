import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getLocalData, setLocalData } from '@/utils/storage';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
    const [formData, setFormData] = useState({
        courseName: '',
        courseCode: '',
        day: '',
        time: '',
        room: '',
        type: 'Lecture',
        class: '',
    });

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
                                        <SelectItem value="Tutorial">Tutorial</SelectItem>
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

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Your classes for the week</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-3 text-left font-semibold bg-muted">Time</th>
                                    {DAYS.map(day => (
                                        <th key={day} className="p-3 text-left font-semibold bg-muted min-w-[150px]">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map(time => (
                                    <tr key={time} className="border-b">
                                        <td className="p-3 font-medium text-sm bg-muted/50 whitespace-nowrap">
                                            {time}
                                        </td>
                                        {DAYS.map(day => {
                                            const classes = getClassesForDayAndTime(day, time);
                                            return (
                                                <td key={`${day}-${time}`} className="p-2">
                                                    {classes.map(cls => (
                                                        <div
                                                            key={cls.id}
                                                            className="bg-primary/10 border border-primary/20 rounded p-2 mb-2 last:mb-0 group relative"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm truncate">{cls.courseName}</p>
                                                                    <p className="text-xs text-muted-foreground">{cls.type} • {cls.room}</p>
                                                                    {cls.class && (
                                                                        <p className="text-xs text-muted-foreground">Class {cls.class}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => handleEdit(cls)}
                                                                    >
                                                                        <Edit className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => openDeleteDialog(cls)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

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
