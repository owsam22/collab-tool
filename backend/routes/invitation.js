const express = require('express');
const router = express.Router();
const { 
  sendInvitation, 
  getMyInvitations, 
  respondToInvitation 
} = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', sendInvitation);
router.get('/my', getMyInvitations);
router.put('/:id/respond', respondToInvitation);

module.exports = router;
