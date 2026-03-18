const Team = require('../models/Team');
const User = require('../models/User');

const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }],
    });
    await team.populate('owner members.user meetings');
    res.status(201).json({ team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user.id }).populate('owner members.user meetings');
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('owner members.user meetings');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ team });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    if (team.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    const team = await Team.findById(req.params.id);
    if (team.members.find(m => m.user.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: 'User already in team' });
    }

    team.members.push({ user: userToAdd._id, role: 'member' });
    await team.save();
    await team.populate('owner members.user meetings');

    // Notify team members
    req.io.to(`team:${team._id}`).emit('notification:new', {
      type: 'team',
      message: `${userToAdd.name} joined the team!`,
      timestamp: new Date(),
    });

    res.json({ team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    const userIdToRemove = req.params.userId;
    if (team.owner.toString() === userIdToRemove) {
      return res.status(400).json({ message: 'Owner cannot be removed' });
    }

    team.members = team.members.filter(m => m.user.toString() !== userIdToRemove);
    await team.save();
    await team.populate('owner members.user meetings');
    res.json({ team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Owner cannot leave the team. Delete the team instead.' });
    }

    const isMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    team.members = team.members.filter(m => m.user.toString() !== req.user.id);
    await team.save();
    res.json({ message: 'Successfully left the team' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  removeMember,
  leaveTeam,
};
