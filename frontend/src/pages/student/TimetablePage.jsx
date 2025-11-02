import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLocalData } from '@/utils/storage';
import { Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetablePage() {
    const [timetable] = useState(getLocalData('timetable', []));
    const [searchQuery, setSearchQuery] = useState('');
    const [dayFilter, setDayFilter] = useState('All Days');
    const [typeFilter, setTypeFilter] = useState('All Types');

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
            if (groups[type]) {
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

    const renderTypeSection = (type, items, icon) => {
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
            <div>
                <h1 className="text-3xl font-bold">Timetable</h1>
                <p className="text-muted-foreground mt-1">Your weekly class schedule</p>
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
                    <p className="text-muted-foreground">
                        Your timetable will be updated by your faculty
                    </p>
                </Card>
            )}
        </div>
    );
}