import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Trash2, Shield, Settings, Users, Save } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useCalendarStore } from '../store/calendarStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalendarSettingsModalProps {
  calendar: any;
  onClose: () => void;
  onUpdate: () => void;
}

const CalendarSettingsModal: React.FC<CalendarSettingsModalProps> = ({ calendar, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');
  const [name, setName] = useState(calendar.name);
  const [description, setDescription] = useState(calendar.description || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentCalendar, calendars, setCalendars } = useCalendarStore();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const updateStore = (updatedCalendar: any) => {
    setCurrentCalendar(updatedCalendar);
    setCalendars(calendars.map(c => c._id === updatedCalendar._id ? updatedCalendar : c));
  };

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.put(`/calendars/${calendar._id}`, { name, description });
      updateStore(res.data);
      toast.success('Calendar updated successfully');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post(`/calendars/${calendar._id}/invite`, { email: inviteEmail, role: inviteRole });
      updateStore(res.data);
      setInviteEmail('');
      toast.success('Member invited successfully');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await api.delete(`/calendars/${calendar._id}/members/${userId}`);
      updateStore(res.data);
      toast.success('Member removed successfully');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleCancelInvitation = async (email: string) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;
    try {
      const res = await api.delete(`/calendars/${calendar._id}/pending/${email}`);
      updateStore(res.data);
      toast.success('Invitation cancelled');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const res = await api.put(`/calendars/${calendar._id}/members/${userId}/role`, { role });
      updateStore(res.data);
      toast.success('Role updated successfully');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center sm:p-4"
    >
      <motion.div
        initial={isMobile ? { y: '100%' } : { scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={isMobile ? { y: '100%' } : { scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "bg-white w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col",
          isMobile ? "h-full rounded-none" : "rounded-3xl max-h-[90vh]"
        )}
      >
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <Settings size={isMobile ? 20 : 24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 sm:py-4 flex items-center justify-center space-x-2 font-bold transition-all text-sm sm:text-base ${
              activeTab === 'general' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Shield size={18} />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 sm:py-4 flex items-center justify-center space-x-2 font-bold transition-all text-sm sm:text-base ${
              activeTab === 'members' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Users size={18} />
            <span>Members</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {activeTab === 'general' ? (
            <form onSubmit={handleUpdateGeneral} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Calendar Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm sm:text-base"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <Save size={20} />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-8 pb-10">
              <form onSubmit={handleInvite} className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Invite New Member</h3>
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="User Email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                    required
                  />
                  <div className="flex gap-3">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-sm sm:text-base"
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Commentor">Commentor</option>
                      <option value="Editor">Editor</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 disabled:opacity-50 text-sm sm:text-base"
                    >
                      <UserPlus size={18} />
                      <span className="hidden sm:inline">Invite</span>
                    </button>
                  </div>
                  {isMobile && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
                    >
                      <UserPlus size={18} />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Current Members</h3>
                <div className="space-y-3">
                  {calendar.members.map((member: any) => (
                    <div key={member.user._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                          {member.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{member.user.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {member.role === 'Owner' ? (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">Owner</span>
                        ) : (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeRole(member.user._id, e.target.value)}
                              className="text-xs font-bold text-slate-600 bg-slate-50 border-none rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-100"
                            >
                              <option value="Viewer">Viewer</option>
                              <option value="Commentor">Commentor</option>
                              <option value="Editor">Editor</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.user._id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {calendar.pendingMembers && calendar.pendingMembers.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider ml-1 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Pending Invitations</span>
                  </h3>
                  <div className="space-y-3">
                    {calendar.pendingMembers.map((pending: any) => (
                      <div key={pending.email} className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl group">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold border border-amber-200">
                            ?
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{pending.email}</p>
                            <p className="text-xs text-amber-600 font-bold uppercase tracking-tight">{pending.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelInvitation(pending.email)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarSettingsModal;
