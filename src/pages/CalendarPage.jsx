import { useState, useEffect, useMemo } from 'react';
import { fetchCalendarEvents } from '../lib/google-calendar';
import { useTasks } from '../hooks/useTasks';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [calError, setCalError] = useState(null);
  const { tasks } = useTasks();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    fetchCalendarEvents(null, start, end)
      .then(setEvents)
      .catch((err) => setCalError(err.message));
  }, [year, month]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return days;
  }, [year, month]);

  const today = new Date();
  const isToday = (day) =>
    day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const selectedStr = selectedDate
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : null;

  const dayEvents = selectedStr
    ? events.filter((e) => e.start.startsWith(selectedStr))
    : [];

  const dayTasks = selectedStr
    ? tasks.filter((t) => t.due_date === selectedStr)
    : [];

  function hasContent(day) {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (
      events.some((e) => e.start.startsWith(dateStr)) ||
      tasks.some((t) => t.due_date === dateStr)
    );
  }

  const monthLabel = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          className="text-gray-400 hover:text-white px-2 py-1"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">{monthLabel}</h1>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          className="text-gray-400 hover:text-white px-2 py-1"
        >
          →
        </button>
      </div>

      {calError && (
        <p className="text-yellow-400 text-xs text-center">
          Calendar unavailable: {calError}
        </p>
      )}

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {DAYS.map((d) => (
          <div key={d} className="text-gray-500 py-1">{d}</div>
        ))}
        {calendarDays.map((day, i) => (
          <button
            key={i}
            disabled={!day}
            onClick={() => day && setSelectedDate(day === selectedDate ? null : day)}
            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative ${
              !day
                ? ''
                : selectedDate === day
                ? 'bg-accent text-white'
                : isToday(day)
                ? 'bg-surface text-accent font-bold'
                : 'hover:bg-surface text-gray-300'
            }`}
          >
            {day}
            {hasContent(day) && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-300">
            {new Date(year, month, selectedDate).toLocaleDateString('default', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h2>

          {dayEvents.length === 0 && dayTasks.length === 0 && (
            <p className="text-gray-500 text-sm">Nothing scheduled</p>
          )}

          {dayEvents.map((event) => (
            <div key={event.id} className="bg-surface rounded-lg p-3 border-l-4 border-purple-500">
              <p className="text-sm">{event.title}</p>
              {!event.allDay && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  {' – '}
                  {new Date(event.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
            </div>
          ))}

          {dayTasks.map((task) => (
            <div key={task.id} className={`bg-surface rounded-lg p-3 border-l-4 ${
              task.completed ? 'border-gray-600' : 'border-accent'
            }`}>
              <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Task · {task.project}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
