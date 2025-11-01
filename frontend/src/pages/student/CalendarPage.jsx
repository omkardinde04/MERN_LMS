import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getLocalData } from '@/utils/storage';
import { Calendar as CalendarIcon, BookOpen, FileText, Award, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

// Public holidays (you can add more)
const publicHolidays = [
    { date: '2025-01-01', name: 'New Year\'s Day', type: 'holiday' },
    { date: '2025-01-26', name: 'Republic Day', type: 'holiday' },
    { date: '2025-08-15', name: 'Independence Day', type: 'holiday' },
    { date: '2025-10-02', name: 'Gandhi Jayanti', type: 'holiday' },
    { date: '2025-11-14', name: 'Diwali', type: 'holiday' },
    { date: '2025-12-25', name: 'Christmas', type: 'holiday' },
];

export default function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const events = getLocalData('events', []);
    const assignments = getLocalData('assignments', []);

    // Combine events, assignments, and holidays
    const allEvents = [
        ...events,
        ...assignments.filter(a => a.status === 'pending').map(a => ({
            id: `assign-${a.id}`,
            title: a.title,
            date: a.dueDate,
            type: 'assignment',
            courseName: a.courseName,
            description: a.description,
        })),
        ...publicHolidays.map(h => ({
            id: `holiday-${h.date}`,
            title: h.name,
            date: h.date,
            type: 'holiday',
            description: 'Public Holiday',
        })),
    ];

    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return allEvents.filter(event => {
            const eventDate = new Date(event.date).toISOString().split('T')[0];
            return eventDate === dateStr;
        });
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'assignment':
                return FileText;
            case 'exam':
            case 'quiz':
            case 'test':
                return Award;
            case 'holiday':
                return PartyPopper;
            default:
                return BookOpen;
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'assignment':
                return 'bg-green-500';
            case 'exam':
            case 'test':
                return 'bg-blue-500';
            case 'quiz':
                return 'bg-orange-500';
            case 'holiday':
                return 'bg-red-500';
            default:
                return 'bg-purple-500';
        }
    };

    const selectedDayEvents = getEventsForDate(date);
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const monthEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });

    // Get dates with events for calendar highlighting
    const datesWithEvents = allEvents.map(e => new Date(e.date));

    // Color legend
    const colorLegend = [
        { color: 'bg-green-500', label: 'Assignments' },
        { color: 'bg-blue-500', label: 'Tests / Exams' },
        { color: 'bg-purple-500', label: 'Events' },
        { color: 'bg-red-500', label: 'Holidays / Breaks' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Calendar</h1>
                <p className="text-muted-foreground mt-1">Track your assignments, exams, and events</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Academic Calendar
                            </CardTitle>
                            <CardDescription>Click on a date to see events</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border w-full"
                                modifiers={{
                                    hasEvent: datesWithEvents,
                                    hasAssignment: allEvents.filter(e => e.type === 'assignment').map(e => new Date(e.date)),
                                    hasTest: allEvents.filter(e => e.type === 'exam' || e.type === 'test').map(e => new Date(e.date)),
                                    hasHoliday: allEvents.filter(e => e.type === 'holiday').map(e => new Date(e.date)),
                                }}
                                modifiersStyles={{
                                    hasEvent: {
                                        backgroundColor: 'hsl(var(--primary))',
                                        color: 'hsl(var(--primary-foreground))',
                                        fontWeight: 'bold'
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Month Events */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Events in {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </CardTitle>
                            <CardDescription>{monthEvents.length} events scheduled</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                            {monthEvents.length > 0 ? (
                                monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => {
                                    const Icon = getEventIcon(event.type);
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setDate(new Date(event.date));
                                            }}
                                        >
                                            <div className={`${getEventColor(event.type)} p-2 rounded-lg flex-shrink-0`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{event.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{event.courseName || event.description}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No events this month</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    {/* Color Legend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Color Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {colorLegend.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className={`${item.color} w-4 h-4 rounded flex-shrink-0`}></div>
                                    <span className="text-sm text-foreground">{item.label}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Selected Day Events */}
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>
                                Events on {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </CardTitle>
                            <CardDescription>{selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.map(event => {
                                    const Icon = getEventIcon(event.type);
                                    return (
                                        <div
                                            key={event.id}
                                            className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors border border-border"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`${getEventColor(event.type)} p-1.5 rounded flex-shrink-0`}>
                                                    <Icon className="h-3 w-3 text-white" />
                                                </div>
                                                <p className="font-medium text-sm">{event.title}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {event.courseName || event.description}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No events scheduled for this date.</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Event Details Dialog */}
            {selectedEvent && (
                <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                    <DialogContent onClose={() => setSelectedEvent(null)}>
                        <DialogHeader>
                            <DialogTitle>{selectedEvent.title}</DialogTitle>
                            <DialogDescription>
                                {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-1">Type</p>
                                <span className={`${getEventColor(selectedEvent.type)} text-white px-3 py-1 rounded-full text-xs capitalize`}>
                                    {selectedEvent.type}
                                </span>
                            </div>
                            {selectedEvent.courseName && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Course</p>
                                    <p className="text-sm text-muted-foreground">{selectedEvent.courseName}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium mb-1">Description</p>
                                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
