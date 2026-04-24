import { Router } from 'express';
import { createCalendar, getCalendars, getCalendar, inviteMember } from '../controllers/calendarController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';

const router = Router();

router.post('/', auth, createCalendar);
router.get('/', auth, getCalendars);
router.get('/:calendarId', auth, checkRole(['Owner', 'Editor', 'Commentor', 'Viewer']), getCalendar);
router.post('/:calendarId/invite', auth, checkRole(['Owner']), inviteMember);

export default router;
