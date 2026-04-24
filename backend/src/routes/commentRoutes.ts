import { Router } from 'express';
import { addComment, getComments } from '../controllers/commentController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Uses eventId for RBAC
router.post('/', auth, checkRole(['Owner', 'Editor', 'Commentor']), addComment);
router.get('/:eventId', auth, checkRole(['Owner', 'Editor', 'Commentor', 'Viewer']), getComments);

export default router;
