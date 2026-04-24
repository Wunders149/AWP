import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Comment from '../models/Comment';
import Event from '../models/Event';

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { text, eventId } = req.body;
    const comment = new Comment({
      text,
      eventId,
      user: req.user?.id
    });
    await comment.save();

    const event = await Event.findById(eventId);
    if (event) {
      const io = req.app.get('io');
      io.to(event.calendarId.toString()).emit('comment:added', { comment, eventId });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const comments = await Comment.find({ eventId: req.params.eventId }).populate('user', 'name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
