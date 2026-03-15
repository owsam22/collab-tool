const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
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

module.exports = router;
