const Invitation = require('../models/Invitation');
const Team = require('../models/Team');
const User = require('../models/User');

const sendInvitation = async (req, res) => {
  try {
    const { teamId, email } = req.body;
    const inviterId = req.user.id;

    // 1. Find the user to invite
    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ message: 'User not found' });

    // 2. Find the team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // 3. Check if inviter is an admin/owner
    const isAdmin = team.owner.toString() === inviterId || 
                    team.members.find(m => m.user.toString() === inviterId && m.role === 'admin');
    if (!isAdmin) return res.status(403).json({ message: 'Only admins can invite members' });

    // 4. Check if already in team
    const isAlreadyMember = team.members.find(m => m.user.toString() === invitee._id.toString());
    if (isAlreadyMember) return res.status(400).json({ message: 'User is already a member of this team' });

    // 5. Check for existing pending invitation
    const existingInvite = await Invitation.findOne({ team: teamId, invitee: invitee._id, status: 'pending' });
    if (existingInvite) return res.status(400).json({ message: 'Invitation already sent and pending' });

    // 6. Create invitation
    const invitation = await Invitation.create({
      team: teamId,
      inviter: inviterId,
      invitee: invitee._id,
    });

    // 7. Notify invitee via Socket.io
    req.io.to(`user:${invitee._id}`).emit('notification:new', {
      type: 'invitation',
      message: `You have been invited to join ${team.name}`,
      data: { invitationId: invitation._id },
      timestamp: new Date(),
    });

    res.status(201).json({ invitation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ invitee: req.user.id, status: 'pending' })
      .populate('team', 'name description')
      .populate('inviter', 'name email');
    res.json({ invitations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const respondToInvitation = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'declined'
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invitation = await Invitation.findById(req.params.id).populate('team');
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    if (invitation.invitee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to respond to this invitation' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
      const team = await Team.findById(invitation.team._id);
      team.members.push({ user: req.user.id, role: 'member' });
      await team.save();

      // Notify inviter
      req.io.to(`user:${invitation.inviter}`).emit('notification:new', {
        type: 'team',
        message: `${req.user.name} accepted your invitation to ${team.name}!`,
        timestamp: new Date(),
      });
    }

    res.json({ message: `Invitation ${status}`, invitation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  sendInvitation,
  getMyInvitations,
  respondToInvitation,
};
