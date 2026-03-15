const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getMeeting,
  getMeetingByRoom,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  leaveMeeting,
} = require('../controllers/meetingController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getMeetings).post(protect, createMeeting);
router.get('/room/:roomId', protect, getMeetingByRoom);
router.route('/:id').get(protect, getMeeting).put(protect, updateMeeting).delete(protect, deleteMeeting);
router.post('/:id/join', protect, joinMeeting);
router.post('/:id/leave', protect, leaveMeeting);

module.exports = router;
