import express from 'express';
import { getTeams, createTeam, addTeamMember, deleteTeam } from '../controllers/teamController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTeams)
  .post(protect, admin, createTeam);

router.post('/:id/members', protect, admin, addTeamMember);
router.delete('/:id', protect, admin, deleteTeam);

export default router;
