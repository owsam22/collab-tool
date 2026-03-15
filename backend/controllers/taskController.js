const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json({ task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { teamId, meetingId } = req.query;
    let query = { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] };
    
    if (teamId) query = { team: teamId };
    if (meetingId) query = { meeting: meetingId };

    const tasks = await Task.find(query).populate('assignedTo createdBy team meeting');
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
