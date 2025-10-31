import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getLocalData } from '@/utils/storage';
import { Calendar as CalendarIcon, BookOpen, FileText, Award, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const events = getLocalData('events', []);

    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'assignment':
                return FileText;
            case 'exam':
            case 'quiz':
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
                return 'bg-blue-500';
            case 'exam':
                return 'bg-red-500';
            case 'quiz':
                return 'bg-orange-500';
            case 'holiday':
                return 'bg-green-500';
            default:
                return 'bg-purple-500';
        }
    };

    const selectedDayEvents = getEventsForDate(date);
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });

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
                                Calendar View
                            </CardTitle>
                            <CardDescription>Click on a date to see events</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                                modifiers={{
                                    hasEvent: events.map(e => new Date(e.date))
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
                            <CardTitle>This Month's Events</CardTitle>
                            <CardDescription>{monthEvents.length} events scheduled</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {monthEvents.length > 0 ? (
                                monthEvents.map(event => {
                                    const Icon = getEventIcon(event.type);
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className={`${getEventColor(event.type)} p-2 rounded-lg`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">{event.courseName || event.description}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(event.date).toLocaleDateString()}
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

                {/* Selected Day Events */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>
                                {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </CardTitle>
                            <CardDescription>{selectedDayEvents.length} events</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.map(event => {
                                    const Icon = getEventIcon(event.type);
                                    return (
                                        <div
                                            key={event.id}
                                            className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`${getEventColor(event.type)} p-1.5 rounded`}>
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
                                <p className="text-sm text-muted-foreground text-center py-8">No events on this day</p>
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
