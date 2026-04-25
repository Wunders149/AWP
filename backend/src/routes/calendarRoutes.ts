import { Router } from 'express';
import { 
  createCalendar, 
  getCalendars, 
  getCalendar, 
  inviteMember,
  updateCalendar,
  removeMember,
  removePendingMember,
  updateMemberRole
} from '../controllers/calendarController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';

const router = Router();

router.post('/', auth, createCalendar);
router.get('/', auth, getCalendars);
router.get('/:calendarId', auth, checkRole(['Owner', 'Editor', 'Commentor', 'Viewer']), getCalendar);
router.put('/:calendarId', auth, checkRole(['Owner']), updateCalendar);
router.post('/:calendarId/invite', auth, checkRole(['Owner']), inviteMember);
router.delete('/:calendarId/members/:userId', auth, checkRole(['Owner']), removeMember);
router.delete('/:calendarId/pending/:email', auth, checkRole(['Owner']), removePendingMember);
router.put('/:calendarId/members/:userId/role', auth, checkRole(['Owner']), updateMemberRole);

export default router;
