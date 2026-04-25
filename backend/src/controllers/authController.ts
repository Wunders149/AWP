import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Calendar from '../models/Calendar';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ name, email, password });
    await user.save();

    // Check for pending calendar invitations
    const pendingCalendars = await Calendar.find({ 'pendingMembers.email': email });
    for (const calendar of pendingCalendars) {
      const pendingInfo = calendar.pendingMembers.find(m => m.email === email);
      if (pendingInfo) {
        calendar.members.push({ user: user._id as any, role: pendingInfo.role });
        calendar.pendingMembers = calendar.pendingMembers.filter(m => m.email !== email);
        await calendar.save();
      }
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
