import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Calendar from '../models/Calendar';
import Event from '../models/Event';

export const checkRole = (requiredRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const params = req.params || {};
      const body = req.body || {};
      let calendarId = params.calendarId || body.calendarId;
      const eventId = params.eventId || body.eventId;
      const userId = req.user?.id;

      console.log(`RBAC Check: calendarId=${calendarId}, eventId=${eventId}, userId=${userId}`);

      if (!calendarId && eventId) {
        const event = await Event.findById(eventId);
        if (event) {
          calendarId = event.calendarId.toString();
        }
      }

      if (!calendarId) {
        return res.status(400).json({ message: 'Calendar ID or Event ID is required' });
      }

      const calendar = await Calendar.findById(calendarId);
      if (!calendar) {
        return res.status(404).json({ message: 'Calendar not found' });
      }

      // Check if user is the owner
      if (calendar.owner.toString() === userId) {
        return next();
      }

      // Check if user is a member with required role
      const member = calendar.members.find(m => m.user.toString() === userId);
      
      if (!member) {
        return res.status(403).json({ message: 'Access denied. You are not a member of this calendar.' });
      }

      if (requiredRoles.includes(member.role)) {
        return next();
      }

      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    } catch (err) {
      console.error('RBAC Middleware Error:', err);
      res.status(500).json({ message: 'Server error in RBAC middleware' });
    }
  };
};
