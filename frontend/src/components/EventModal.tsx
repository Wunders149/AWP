import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Clock, AlignLeft, MessageSquare, Info, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EventModalProps {
  event: any;
  isNew: boolean;
  onClose: () => void;
  calendarId: string;
}

const EventModal: React.FC<EventModalProps> = ({ event, isNew, onClose, calendarId }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [start, setStart] = useState(event?.start?.substring(0, 16) || '');
  const [end, setEnd] = useState(event?.end?.substring(0, 16) || '');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const { currentCalendar } = useCalendarStore();
  const { user } = useAuthStore();

  const userRole = currentCalendar?.members.find(m => m.user._id === user?.id)?.role || 'Viewer';
  const canEdit = userRole === 'Editor' || userRole === 'Owner';
  const canComment = userRole !== 'Viewer';

  useEffect(() => {
    if (!isNew && event?._id) {
      const fetchComments = async () => {
        try {
          const res = await api.get(`/comments/${event._id}`);
          setComments(res.data);
        } catch (err) {
          console.error('Failed to fetch comments');
        }
      };
      fetchComments();
    }
  }, [event?._id, isNew]);

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Title is required');
    
    const promise = isNew 
      ? api.post('/events', { title, description, start, end, calendarId })
      : api.put(`/events/${event._id}`, { title, description, start, end });

    toast.promise(promise, {
      loading: isNew ? 'Creating event...' : 'Updating event...',
      success: isNew ? 'Event created!' : 'Event updated!',
      error: 'Action failed'
    });

    try {
      await promise;
      onClose();
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(`/events/${event._id}`);
      onClose();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post('/comments', { text: newComment, eventId: event._id });
      setComments([...comments, { ...res.data, user: { name: user?.name } }]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100">
          <div className="flex space-x-6">
            <button 
              onClick={() => setActiveTab('details')}
              className={cn(
                "pb-4 text-sm font-bold transition-all relative",
                activeTab === 'details' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Details
              {activeTab === 'details' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
            </button>
            {!isNew && (
              <button 
                onClick={() => setActiveTab('comments')}
                className={cn(
                  "pb-4 text-sm font-bold transition-all relative flex items-center",
                  activeTab === 'comments' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Comments 
                <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">{comments.length}</span>
                {activeTab === 'comments' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors mb-4">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="p-8 space-y-8">
              {/* Role Badge */}
              <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full w-fit">
                <Shield size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{userRole} Perspective</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500 mt-1">
                    <Info size={20} />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Event Title"
                      disabled={!canEdit}
                      className="w-full text-2xl font-black text-slate-900 placeholder:text-slate-300 bg-transparent outline-none disabled:opacity-70"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500 mt-1">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Starts</label>
                      <input
                        type="datetime-local"
                        disabled={!canEdit}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-semibold disabled:opacity-50"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Ends</label>
                      <input
                        type="datetime-local"
                        disabled={!canEdit}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-semibold disabled:opacity-50"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500 mt-1">
                    <AlignLeft size={20} />
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Add a description or notes..."
                      disabled={!canEdit}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none h-32 transition-all text-sm font-medium resize-none disabled:opacity-50"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 flex flex-col h-[500px]">
              <div className="flex-1 space-y-6 overflow-y-auto mb-6 pr-2 scrollbar-hide">
                {comments.map((c, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0">
                      {c.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">{c.user?.name}</p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{c.text}</p>
                    </div>
                  </motion.div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-20 flex flex-col items-center">
                    <MessageSquare size={40} className="text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold">No comments yet</p>
                  </div>
                )}
              </div>

              {canComment && (
                <form onSubmit={handleAddComment} className="relative group">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          {!isNew && canEdit && (
            <button
              onClick={handleDelete}
              className="text-slate-400 hover:text-red-500 p-2 transition-colors flex items-center font-bold text-sm"
            >
              <Trash2 size={18} className="mr-2" /> Delete Event
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-500 font-bold hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200"
            >
              Discard
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                {isNew ? 'Create Event' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventModal;
