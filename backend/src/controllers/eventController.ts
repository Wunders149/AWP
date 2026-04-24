import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Event from '../models/Event';

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, start, end, allDay, calendarId } = req.body;
    const event = new Event({
      title,
      description,
      start,
      end,
      allDay,
      calendarId,
      creator: req.user?.id
    });
    await event.save();

    const io = req.app.get('io');
    io.to(calendarId).emit('event:created', event);

    res.status(201).json(event);
  } catch (err) {
    console.error('Event API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ calendarId: req.params.calendarId });
    res.json(events);
  } catch (err) {
    console.error('Event API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, start, end, allDay } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.title = title || event.title;
    event.description = description || event.description;
    event.start = start || event.start;
    event.end = end || event.end;
    event.allDay = allDay !== undefined ? allDay : event.allDay;

    await event.save();

    const io = req.app.get('io');
    io.to(event.calendarId.toString()).emit('event:updated', event);

    res.json(event);
  } catch (err) {
    console.error('Event API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const calendarId = event.calendarId.toString();
    await event.deleteOne();

    const io = req.app.get('io');
    io.to(calendarId).emit('event:deleted', req.params.eventId);

    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error('Event API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
