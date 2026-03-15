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
    res.json({ team });
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
  addMember,
};
