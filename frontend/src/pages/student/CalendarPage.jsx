import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// removed FullCalendar and plugin imports to avoid build errors
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getLocalData } from '@/utils/storage';

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsByDate, setEventsByDate] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    const updateCalendarEvents = () => {
      const assignments = getLocalData('assignments', []);
      const currentDate = new Date();

      // map events to yyyy-mm-dd keys
      const map = {};
      assignments
        .filter((a) => a.status === 'pending')
        .forEach((a) => {
          const due = new Date(a.dueDate);
          const key = due.toISOString().slice(0, 10);
          const isOverdue = currentDate > due;
          const daysUntilDue = Math.ceil((due - currentDate) / (1000 * 60 * 60 * 24));

          const evt = {
            id: `assign-${a.id}`,
            title: a.title,
            dateKey: key,
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
              raw: a,
            },
          };

          if (!map[key]) map[key] = [];
          map[key].push(evt);
        });

      // --- NEW: load public holidays (from local storage if provided, otherwise defaults for current year) ---
      const year = currentDate.getFullYear();
      const defaultHolidays = [
        { id: 'ny', name: "New Year's Day", date: `${year}-01-01`, description: "New Year's Day" },
        { id: 'indep', name: 'Independence Day', date: `${year}-07-04`, description: 'Independence Day' },
        { id: 'labor', name: "Labor Day", date: (() => { // first Monday in Sept
            const d = new Date(year, 8, 1);
            while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
            return d.toISOString().slice(0,10);
          })(), description: 'Labor Day' },
        { id: 'xmas', name: 'Christmas Day', date: `${year}-12-25`, description: 'Christmas Day' },
      ];
      const storedHolidays = getLocalData('holidays', null);
      const holidays = Array.isArray(storedHolidays) ? storedHolidays : defaultHolidays;

      holidays.forEach((h, idx) => {
        // ensure date string YYYY-MM-DD
        const key = (h.date || '').slice(0,10);
        if (!key) return;
        const evt = {
          id: `holiday-${h.id ?? idx}`,
          title: `🎉 ${h.name}`,
          dateKey: key,
          backgroundColor: '#3b82f6', // blue for holidays
          borderColor: '#2563eb',
          textColor: '#ffffff',
          extendedProps: {
            type: 'holiday',
            courseName: '',
            description: h.description || h.name,
            status: 'Public Holiday',
            isHoliday: true,
            raw: h,
          },
        };
        if (!map[key]) map[key] = [];
        // ensure holidays appear first in the day's list
        map[key].unshift(evt);
      });
      // --- END NEW ---

      setEventsByDate(map);
    };

    updateCalendarEvents();
    const intervalId = setInterval(updateCalendarEvents, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDayIndex = startOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const totalDays = endOfMonth.getDate();

  const cells = [];
  // build 6 weeks grid (42 cells)
  for (let i = 0; i < 42; i++) {
    const dayNumber = i - startDayIndex + 1;
    let cellDate = null;
    if (dayNumber > 0 && dayNumber <= totalDays) {
      cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
    }
    cells.push(cellDate);
  }

  const formatKey = (d) => d.toISOString().slice(0, 10);

  const handlePrev = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const handleNext = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const handleEventClick = (evt) => {
    setSelectedEvent({
      ...evt.extendedProps,
      title: evt.title,
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
                {/* --- NEW: Holiday legend item --- */}
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div> Holiday
                </span>
                {/* --- END NEW --- */}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded border" onClick={handlePrev}>Prev</button>
                <button className="px-3 py-1 rounded border" onClick={handleToday}>Today</button>
                <button className="px-3 py-1 rounded border" onClick={handleNext}>Next</button>
              </div>
              <div className="text-sm font-medium">
                {currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                  <div key={d} className="weekday">{d}</div>
                ))}
              </div>

              <div className="calendar-cells">
                {cells.map((cellDate, idx) => {
                  if (!cellDate) {
                    return <div key={idx} className="cell empty"></div>;
                  }
                  const key = formatKey(cellDate);
                  const cellEvents = eventsByDate[key] || [];
                  const isToday = formatKey(new Date()) === key;
                  return (
                    <div key={idx} className={`cell ${isToday ? 'today' : ''}`}>
                      <div className="cell-header">
                        <span className="day-number">{cellDate.getDate()}</span>
                      </div>
                      <div className="cell-events">
                        {cellEvents.slice(0, 3).map((evt) => (
                          <button
                            key={evt.id}
                            className="event-badge"
                            style={{ backgroundColor: evt.backgroundColor, color: evt.textColor }}
                            title={`${evt.title} — ${evt.extendedProps.courseName} — ${evt.extendedProps.status}`}
                            onClick={() => handleEventClick(evt)}
                          >
                            {evt.title}
                          </button>
                        ))}
                        {cellEvents.length > 3 && (
                          <div className="more-count">+{cellEvents.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Click an event to view details.
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
        .calendar-container { width: 100%; }
        .calendar-grid { display: flex; flex-direction: column; gap: 8px; }
        .calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); }
        .weekday { text-align: center; font-size: 0.875rem; color: #6b7280; padding: 6px 0; }
        .calendar-cells { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .cell { min-height: 96px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px; background: var(--card) }
        .cell.empty { background: transparent; border: none; }
        .cell.today { background: #f8fafc; border-color: #c7d2fe; }
        .cell-header { display:flex; justify-content:flex-end; }
        .day-number { font-size: 0.75rem; color: #374151; }
        .cell-events { display:flex; flex-direction:column; gap:4px; margin-top:6px; }
        .event-badge { text-align:left; padding:4px 6px; border-radius:4px; font-size:0.75rem; border:none; cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .more-count { font-size: 0.7rem; color:#6b7280; }
        /* keep some of the original styles for consistency */
        .text-muted-foreground { color: #6b7280; }
      `}</style>
    </div>
  );
}
