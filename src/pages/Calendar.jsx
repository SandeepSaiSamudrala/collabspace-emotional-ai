import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Bell, BellOff, Calendar as CalendarIcon } from 'lucide-react';
import { auth } from '../services/firebase';
import { 
  createEvent, 
  subscribeToEvents, 
  deleteEvent,
  updateEvent
} from '../services/firestoreServices';
import { toast } from 'react-toastify';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ 
    date: '', 
    title: '', 
    time: '', 
    type: 'meeting',
    reminder: false,
    reminderMinutes: 30
  });

  // Load events from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToEvents((loadedEvents) => {
      setEvents(loadedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check for upcoming reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      events.forEach(event => {
        if (!event.reminder || event.notified) return;

        const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
        const reminderTime = new Date(eventDate.getTime() - (event.reminderMinutes || 30) * 60000);

        if (now >= reminderTime && now < eventDate) {
          toast.info(`📅 Reminder: ${event.title} starts in ${event.reminderMinutes || 30} minutes!`, {
            autoClose: 10000,
          });
            // ✅ ADD NOTIFICATION
        createNotification({
          userId: auth.currentUser?.uid,
          type: 'system',
          title: 'Event Reminder',
          body: `${event.title} starts in ${event.reminderMinutes || 30} minutes`,
          actor: 'Calendar',
          icon: 'deploy'
        });
          // Mark as notified to avoid duplicate notifications
          updateEvent(event.id, { notified: true }).catch(console.error);
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [events]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleAddEvent = async () => {
    if (!newEvent.date || !newEvent.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createEvent({
        date: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(newEvent.date).padStart(2, '0')}`,
        day: Number(newEvent.date),
        month: currentMonth.getMonth(),
        year: currentMonth.getFullYear(),
        title: newEvent.title,
        time: newEvent.time,
        type: newEvent.type,
        reminder: newEvent.reminder,
        reminderMinutes: newEvent.reminderMinutes,
        notified: false,
        createdBy: auth.currentUser?.uid,
      });

      toast.success('Event created successfully!');
      setShowModal(false);
      setNewEvent({ date: '', title: '', time: '', type: 'meeting', reminder: false, reminderMinutes: 30 });
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this event?')) return;

    try {
      await deleteEvent(eventId);
      toast.success('Event deleted');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const toggleReminder = async (event, e) => {
    e.stopPropagation();
    try {
      await updateEvent(event.id, { 
        reminder: !event.reminder,
        notified: false // Reset notification flag
      });
      toast.success(event.reminder ? 'Reminder disabled' : 'Reminder enabled');
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const setDailyMoodReminder = () => {
    toast.success('Daily mood check-in reminder set for 9:00 AM!');
    setShowReminderModal(false);
    // You can implement actual daily reminder logic here
  };

  // Filter events for current month
  const currentMonthEvents = events.filter(
    e => e.month === currentMonth.getMonth() && e.year === currentMonth.getFullYear()
  );

  // Get events for specific day
  const getEventsForDay = (day) => {
    return currentMonthEvents.filter(e => e.day === day);
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

const upcomingEvents = currentMonthEvents.sort((a, b) => a.day - b.day);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f1524] text-gray-200">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
          <p className="text-xl">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 h-full bg-[#0f1524] text-gray-200 overflow-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-sm text-gray-400 mt-1">
            {currentMonthEvents.length} events this month • {upcomingEvents.length} upcoming
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 rounded-lg transition"
        >
          <Plus size={20} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-[#1a243b] rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={prevMonth} 
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth} 
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const hasEvent = dayEvents.length > 0;
              const isToday = 
                day === new Date().getDate() && 
                currentMonth.getMonth() === new Date().getMonth() && 
                currentMonth.getFullYear() === new Date().getFullYear();

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setNewEvent({ ...newEvent, date: day });
                    setShowModal(true);
                  }}
                  className={`aspect-square p-2 rounded-lg cursor-pointer transition ${
                    isToday 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50' 
                      : hasEvent 
                      ? 'bg-blue-600/20 hover:bg-blue-600/30' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {hasEvent && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            event.type === 'meeting' ? 'bg-blue-400' :
                            event.type === 'deadline' ? 'bg-red-400' :
                            'bg-green-400'
                          }`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <div className="bg-[#1a243b] rounded-xl border border-white/10 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-blue-400" />
              Upcoming Events
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.slice(0, 5).map((event) => (
                  <motion.div 
                    key={event.id} 
                    whileHover={{ x: 4 }} 
                    className={`p-3 rounded-lg border-l-4 relative group ${
                      event.type === 'meeting' 
                        ? 'bg-blue-600/20 border-blue-500' 
                        : event.type === 'deadline' 
                        ? 'bg-red-600/20 border-red-500' 
                        : 'bg-green-600/20 border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {monthNames[event.month]} {event.day}
                        </p>
                        {event.time && (
                          <p className="text-xs text-gray-500 mt-1">{event.time}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => toggleReminder(event, e)}
                          className={`p-1 rounded ${
                            event.reminder 
                              ? 'text-yellow-400 hover:text-yellow-500' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                          title={event.reminder ? 'Disable reminder' : 'Enable reminder'}
                        >
                          {event.reminder ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteEvent(event.id, e)}
                          className="p-1 text-red-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#1a243b] rounded-xl border border-white/10 p-4">
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Events:</span>
                <span className="font-semibold text-lg">{currentMonthEvents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Meetings:</span>
                <span className="font-semibold text-blue-400">
                  {currentMonthEvents.filter(e => e.type === 'meeting').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Deadlines:</span>
                <span className="font-semibold text-red-400">
                  {currentMonthEvents.filter(e => e.type === 'deadline').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Mood Check-ins:</span>
                <span className="font-semibold text-green-400">
                  {currentMonthEvents.filter(e => e.type === 'mood').length}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Mood Check-in */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-600/40 to-purple-600/40 rounded-xl p-4 border border-white/10"
          >
            <h3 className="font-semibold mb-2">Schedule Mood Check-in</h3>
            <p className="text-sm text-gray-300 mb-3">
              Set a daily reminder for mood tracking
            </p>
            <button 
              onClick={() => setShowReminderModal(true)}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg transition font-medium"
            >
              Set Daily Reminder
            </button>
          </motion.div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a243b] w-full max-w-md rounded-xl p-6 border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Event</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                min="1"
                max={daysInMonth}
                placeholder="Day (1-31)"
                value={newEvent.date}
                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full bg-[#212d45] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500 transition"
              />

              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full bg-[#212d45] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500 transition"
              />

              <input
                type="time"
                value={newEvent.time}
                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full bg-[#212d45] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500 transition"
              />

              <select
                value={newEvent.type}
                onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full bg-[#212d45] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500 transition"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="mood">Mood Check-in</option>
              </select>

              {/* Reminder Options */}
              <div className="bg-[#212d45] border border-white/10 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEvent.reminder}
                    onChange={e => setNewEvent({ ...newEvent, reminder: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Enable reminder</span>
                </label>
                
                {newEvent.reminder && (
                  <select
                    value={newEvent.reminderMinutes}
                    onChange={e => setNewEvent({ ...newEvent, reminderMinutes: Number(e.target.value) })}
                    className="w-full bg-[#0f1524] border border-white/10 rounded-lg p-2 outline-none mt-2 text-sm"
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                )}
              </div>

              <button 
                onClick={handleAddEvent} 
                disabled={!newEvent.date || !newEvent.title}
                className="w-full bg-blue-600/40 hover:bg-blue-600/60 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Add Event
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mood Reminder Modal */}
      {showReminderModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a243b] w-full max-w-md rounded-xl p-6 border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Daily Mood Reminder</h2>
              <button onClick={() => setShowReminderModal(false)}>
                <X size={22} />
              </button>
            </div>

            <p className="text-gray-400 mb-4">
              You'll receive a daily reminder at 9:00 AM to check in with your mood and track your emotional wellbeing.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowReminderModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={setDailyMoodReminder}
                className="flex-1 bg-blue-600/40 hover:bg-blue-600/60 py-2 rounded-lg transition"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
