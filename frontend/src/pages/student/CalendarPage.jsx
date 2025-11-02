import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getLocalData } from '@/utils/storage';

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const updateCalendarEvents = () => {
      const assignments = getLocalData('assignments', []);
      const currentDate = new Date();

      const formattedEvents = assignments
        .filter((a) => a.status === 'pending')
        .map((a) => {
          const dueDate = new Date(a.dueDate);
          const isOverdue = currentDate > dueDate;
          const daysUntilDue = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));

          return {
            id: `assign-${a.id}`,
            title: `📝 ${a.title}`,
            start: a.dueDate,
            end: a.dueDate,
            backgroundColor: isOverdue ? '#ef4444' : daysUntilDue <= 3 ? '#f97316' : '#22c55e',
            borderColor: isOverdue ? '#dc2626' : daysUntilDue <= 3 ? '#ea580c' : '#16a34a',
            textColor: '#ffffff',
            extendedProps: {
              type: 'assignment',
              courseName: a.courseName,
              description: a.description,
              status: isOverdue ? 'Overdue' : `Due in ${daysUntilDue} days`,
              isOverdue,
              daysUntilDue,
            },
          };
        });

      setEvents(formattedEvents);
    };

    // Initial update
    updateCalendarEvents();

    // Set up interval to check for updates every minute
    const intervalId = setInterval(updateCalendarEvents, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const getEventColor = (type) => {
    switch (type) {
      case 'assignment':
        return '#22c55e';
      case 'exam':
      case 'test':
        return '#3b82f6';
      case 'quiz':
        return '#f97316';
      case 'holiday':
        return '#ef4444';
      default:
        return '#a855f7';
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      ...clickInfo.event.extendedProps,
      title: clickInfo.event.title,
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">Track your assignments, exams, and events</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="calendar-container"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Academic Calendar</span>
              <div className="flex gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Overdue
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#f97316]"></div> Due Soon
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div> Upcoming
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[700px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                height="100%"
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short',
                }}
                dayMaxEvents={true}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                eventDidMount={(info) => {
                  // Add tooltip with more details
                  const tooltip = `
                    ${info.event.title}
                    ${info.event.extendedProps.courseName}
                    ${info.event.extendedProps.status}
                  `;
                  info.el.setAttribute('title', tooltip);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${selectedEvent.isOverdue
                      ? 'bg-red-500'
                      : selectedEvent.daysUntilDue <= 3
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                >
                  {selectedEvent.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Course</p>
                <p className="text-sm text-muted-foreground">{selectedEvent.courseName}</p>
              </div>
              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <style jsx global>{`
        .fc {
          --fc-border-color: #e5e7eb;
          --fc-button-bg-color: #f3f4f6;
          --fc-button-border-color: #e5e7eb;
          --fc-button-text-color: #374151;
          --fc-button-hover-bg-color: #e5e7eb;
          --fc-button-hover-border-color: #d1d5db;
          --fc-button-active-bg-color: #d1d5db;
          --fc-button-active-border-color: #9ca3af;
        }
        .fc .fc-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          border-radius: 0.375rem;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: var(--fc-button-active-bg-color);
          border-color: var(--fc-button-active-border-color);
        }
        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: var(--fc-border-color);
        }
        .fc-day-today {
          background-color: #f8fafc !important;
        }
        .fc-event {
          border-radius: 4px;
          border: none;
          padding: 2px 4px;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
