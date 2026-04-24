import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';

const router = Router();

// calendarId is in params or body
router.post('/', auth, checkRole(['Owner', 'Editor']), createEvent);
router.get('/:calendarId', auth, checkRole(['Owner', 'Editor', 'Commentor', 'Viewer']), getEvents);
router.put('/:eventId', auth, checkRole(['Owner', 'Editor']), updateEvent);
router.delete('/:eventId', auth, checkRole(['Owner', 'Editor']), deleteEvent);

export default router;
