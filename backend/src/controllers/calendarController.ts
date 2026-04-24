import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Calendar from '../models/Calendar';
import User from '../models/User';

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
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: 'User not found' });

    const calendar = await Calendar.findById(req.params.calendarId);
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });

    const isMember = calendar.members.find(m => m.user.toString() === userToInvite._id.toString());
    if (isMember) return res.status(400).json({ message: 'User is already a member' });

    calendar.members.push({ user: userToInvite._id as any, role });
    await calendar.save();
    res.json(calendar);
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
