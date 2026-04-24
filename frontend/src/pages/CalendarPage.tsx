import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import { ChevronLeft, Users, Settings, Plus, LayoutGrid, Calendar as CalendarIcon, AlertCircle, Loader } from 'lucide-react';
import EventModal from '../components/EventModal';

const CalendarPage: React.FC = () => {
  const { calendarId } = useParams<{ calendarId: string }>();
  const navigate = useNavigate();
  const { currentCalendar, setCurrentCalendar, events, setEvents, addEvent, updateEvent, removeEvent } = useCalendarStore();
  const { user } = useAuthStore();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!calendarId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [calRes, eventsRes] = await Promise.all([
          api.get(`/calendars/${calendarId}`),
          api.get(`/events/${calendarId}`)
        ]);
        setCurrentCalendar(calRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        const errorMsg = 'Failed to load calendar';
        setError(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join:calendar', calendarId);

    socketRef.current.on('event:created', (event) => {
      addEvent(event);
      toast.success('New event added');
    });

    socketRef.current.on('event:updated', (event) => {
      updateEvent(event);
      toast.success('Event updated');
    });

    socketRef.current.on('event:deleted', (eventId) => {
      removeEvent(eventId);
      toast.success('Event deleted');
    });

    return () => {
      socketRef.current?.emit('leave:calendar', calendarId);
      socketRef.current?.disconnect();
    };
  }, [calendarId, setCurrentCalendar, setEvents, addEvent, updateEvent, removeEvent, navigate]);

  const handleDateSelect = (selectInfo: any) => {
    const userRole = currentCalendar?.members.find(m => m.user._id === user?.id)?.role || 'Viewer';
    if (userRole === 'Viewer' || userRole === 'Commentor') {
      toast.error('You do not have permission to create events');
      return;
    }

    setSelectedEvent({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      calendarId
    });
    setIsNewEvent(true);
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(events.find(e => e._id === clickInfo.event.id));
    setIsNewEvent(false);
    setShowEventModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-semibold">Loading calendar...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Calendar</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-72 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col z-20"
      >
        <div className="p-6">
          <motion.button 
            onClick={() => navigate('/')}
            whileHover={{ x: -4 }}
            className="flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-8 group"
          >
            <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </motion.button>

          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <CalendarIcon className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold text-slate-900 truncate">{currentCalendar?.name}</h1>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold transition-all hover:bg-indigo-100">
              <LayoutGrid size={20} />
              <span>Calendar View</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-200 rounded-2xl font-semibold transition-all">
              <Users size={20} />
              <span>Members ({currentCalendar?.members.length || 0})</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-200 rounded-2xl font-semibold transition-all">
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Role</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-bold text-slate-700 uppercase">
                {currentCalendar?.members.find(m => m.user._id === user?.id)?.role || 'Viewer'}
              </span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-white to-slate-50">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events.map(e => ({
              id: e._id,
              title: e.title,
              start: e.start,
              end: e.end,
              allDay: e.allDay,
              color: '#6366f1'
            }))}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="100%"
          />
        </div>
      </main>

      <AnimatePresence>
        {showEventModal && (
          <EventModal
            event={selectedEvent}
            isNew={isNewEvent}
            onClose={() => setShowEventModal(false)}
            calendarId={calendarId!}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
