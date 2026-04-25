import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Calendar from '../models/Calendar';
import User from '../models/User';
import { sendInvitationEmail } from '../utils/mailer';

export const createCalendar = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const calendar = new Calendar({
      name,
      description,
      owner: req.user?.id,
      members: [{ user: req.user?.id, role: 'Owner' }]
    });
    await calendar.save();
    res.status(201).json(calendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCalendars = async (req: AuthRequest, res: Response) => {
  try {
    const calendars = await Calendar.find({
      'members.user': req.user?.id
    }).populate('owner', 'name email');
    res.json(calendars);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCalendar = async (req: AuthRequest, res: Response) => {
  try {
    const calendar = await Calendar.findById(req.params.calendarId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });
    res.json(calendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body;
    const calendar = await Calendar.findById(req.params.calendarId);
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });

    const userToInvite = await User.findOne({ email });
    
    if (userToInvite) {
      const isMember = calendar.members.find(m => m.user.toString() === userToInvite._id.toString());
      if (isMember) return res.status(400).json({ message: 'User is already a member' });
      
      calendar.members.push({ user: userToInvite._id as any, role });
    } else {
      const isPending = calendar.pendingMembers.find(m => m.email === email);
      if (isPending) return res.status(400).json({ message: 'User already has a pending invitation' });
      
      calendar.pendingMembers.push({ email, role });
    }

    await calendar.save();
    
    // Send invitation email (don't await so API response isn't delayed)
    const inviter = await User.findById(req.user?.id);
    sendInvitationEmail(email, calendar.name, inviter?.name || 'A user')
      .catch(err => console.error('Error sending invitation email:', err));

    const updatedCalendar = await Calendar.findById(calendar._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
      
    res.json(updatedCalendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCalendar = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const calendar = await Calendar.findByIdAndUpdate(
      req.params.calendarId,
      { name, description },
      { new: true }
    ).populate('owner', 'name email')
     .populate('members.user', 'name email');
     
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });
    res.json(calendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const calendar = await Calendar.findById(req.params.calendarId);
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });

    // Cannot remove the owner
    if (calendar.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the owner of the calendar' });
    }

    calendar.members = calendar.members.filter(m => m.user.toString() !== userId);
    await calendar.save();
    
    const updatedCalendar = await Calendar.findById(calendar._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(updatedCalendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removePendingMember = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.params;
    const calendar = await Calendar.findById(req.params.calendarId);
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });

    calendar.pendingMembers = calendar.pendingMembers.filter(m => m.email !== email);
    await calendar.save();
    
    const updatedCalendar = await Calendar.findById(calendar._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(updatedCalendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const calendar = await Calendar.findById(req.params.calendarId);
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });

    const memberIndex = calendar.members.findIndex(m => m.user.toString() === userId);
    if (memberIndex === -1) return res.status(404).json({ message: 'Member not found' });

    // Cannot change owner's role through this endpoint
    if (calendar.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot change owner role' });
    }

    calendar.members[memberIndex].role = role;
    await calendar.save();
    
    const updatedCalendar = await Calendar.findById(calendar._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(updatedCalendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
