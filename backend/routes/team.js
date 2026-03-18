const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  leaveTeam,
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTeams)
  .post(createTeam);

router.route('/:id')
  .get(getTeam)
  .put(updateTeam)
  .delete(deleteTeam);

router.post('/:id/members', addMember);
router.post('/:id/leave', leaveTeam);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
