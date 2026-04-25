import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Calendar as CalendarIcon, LogOut, ChevronRight, User, Loader } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [newCalendarName, setNewCalendarName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { calendars, setCalendars } = useCalendarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/calendars');
        setCalendars(res.data);
      } catch (err) {
        toast.error('Failed to load calendars');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendars();
  }, [setCalendars]);

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCalendarName.trim()) {
      toast.error('Calendar name is required');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.post('/calendars', { name: newCalendarName });
      setCalendars([...calendars, res.data]);
      setNewCalendarName('');
      setShowModal(false);
      toast.success('Calendar created successfully!');
    } catch (err) {
      toast.error('Failed to create calendar');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleNavigateToCalendar = (calendarId: string) => {
    navigate(`/calendar/${calendarId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 md:space-x-3"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg shadow-indigo-200">
              <CalendarIcon className="text-white" size={18} md:size={24} />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SmileCalendar
            </span>
          </motion.div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-indigo-100"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-full shadow-lg">
                <User size={14} className="text-white" />
              </div>
              <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
                {user?.name || 'User'}
              </span>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">My Calendars</h2>
            <p className="text-slate-500 font-medium">Manage your schedules and collaborations</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-indigo-300 hover:shadow-indigo-400 transition-all"
          >
            <Plus size={20} className="mr-2" /> New Calendar
          </motion.button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-48 bg-slate-100 rounded-3xl"
              />
            ))}
          </div>
        ) : calendars.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {calendars.map((cal, index) => (
              <motion.div
                key={cal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => handleNavigateToCalendar(cal._id)}
                className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-200 transition-all relative overflow-hidden"
              >
                {/* Gradient Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarIcon className="text-indigo-600 group-hover:text-purple-600 transition-colors" size={24} />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={20} className="text-indigo-400" />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {cal.name}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                    {cal.description || 'No description provided for this calendar.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex -space-x-2">
                      {cal.members.slice(0, 3).map((m: any, i: number) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.1, zIndex: 10 }}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                          title={m.user?.name}
                        >
                          {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </motion.div>
                      ))}
                      {cal.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                          +{cal.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {cal.members.length} {cal.members.length === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
          >
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CalendarIcon className="text-indigo-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No calendars yet</h3>
            <p className="text-slate-500 mb-8">Create your first calendar to start organizing your events!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-2 rounded-xl hover:shadow-lg transition-all"
            >
              Create Your First Calendar
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Create Calendar Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Create New Calendar</h2>
              <form onSubmit={handleCreateCalendar}>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Calendar Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Work Team, Family, Projects..."
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      value={newCalendarName}
                      onChange={(e) => setNewCalendarName(e.target.value)}
                      required
                      autoFocus
                      disabled={isCreating}
                      maxLength={50}
                    />
                    <p className="text-xs text-slate-400 mt-1 ml-1">{newCalendarName.length}/50 characters</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg shadow-indigo-300 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
