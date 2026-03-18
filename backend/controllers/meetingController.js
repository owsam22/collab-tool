const Meeting = require('../models/Meeting');
const Whiteboard = require('../models/Whiteboard');
const Team = require('../models/Team');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new meeting
// @route   POST /api/meetings
exports.createMeeting = async (req, res) => {
  try {
    const { title, description, scheduledAt, team: teamId } = req.body;
    const roomId = uuidv4();

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'Assigning a team is required for all meetings.' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const isMember = team.owner.toString() === req.user._id.toString() || 
                     team.members.some(m => m.user.toString() === req.user._id.toString());
    
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You must be a member of the team to create a meeting.' });
    }

    const meeting = await Meeting.create({
      title,
      description,
      host: req.user._id,
      roomId,
      team: teamId,
      scheduledAt: scheduledAt || Date.now(),
      participants: [{ user: req.user._id, role: 'admin' }],
    });

    // Update the Team model
    team.meetings.push(meeting._id);
    await team.save();

    // Create associated whiteboard
    await Whiteboard.create({ meeting: meeting._id });

    const populated = await Meeting.findById(meeting._id)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    // Notify team members
    req.io.to(`team:${teamId}`).emit('notification:new', {
      type: 'meeting',
      message: `New meeting "${title}" scheduled in your team.`,
      timestamp: new Date(),
    });

    res.status(201).json({ success: true, meeting: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all meetings for the current user
// @route   GET /api/meetings
exports.getMeetings = async (req, res) => {
  try {
    const { teamId } = req.query;
    let query = {
      $or: [
        { host: req.user._id },
        { 'participants.user': req.user._id },
      ],
    };

    if (teamId) {
      query = { team: teamId };
    } else {
      // Also get meetings for teams the user belongs to
      const Team = require('../models/Team');
      const userTeams = await Team.find({ 'members.user': req.user._id }).select('_id');
      const teamIds = userTeams.map(t => t._id);
      if (teamIds.length > 0) {
        query.$or.push({ team: { $in: teamIds } });
      }
    }

    const meetings = await Meeting.find(query)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: meetings.length, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single meeting by ID
// @route   GET /api/meetings/:id
exports.getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get meeting by roomId
// @route   GET /api/meetings/room/:roomId
exports.getMeetingByRoom = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ roomId: req.params.roomId })
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
exports.updateMeeting = async (req, res) => {
  try {
    const { title, description, status, scheduledAt } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the host can update this meeting' });
    }

    if (title) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (status) meeting.status = status;
    if (scheduledAt) meeting.scheduledAt = scheduledAt;
    if (status === 'ended') meeting.endedAt = Date.now();

    await meeting.save();
    const populated = await Meeting.findById(meeting._id)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    res.json({ success: true, meeting: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (meeting.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this meeting' });
    }

    await Whiteboard.findOneAndDelete({ meeting: meeting._id });
    await Meeting.findByIdAndDelete(meeting._id);

    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a meeting
// @route   POST /api/meetings/:id/join
exports.joinMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    const alreadyJoined = meeting.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!alreadyJoined) {
      meeting.participants.push({ user: req.user._id, role: req.user.role });
      await meeting.save();
    }

    if (meeting.status === 'scheduled') {
      const isHost = meeting.host.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (isHost || isAdmin) {
        meeting.status = 'active';
        await meeting.save();
      }
    }

    const populated = await Meeting.findById(meeting._id)
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    res.json({ success: true, meeting: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave a meeting
// @route   POST /api/meetings/:id/leave
exports.leaveMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    meeting.participants = meeting.participants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );

    await meeting.save();

    res.json({ success: true, message: 'Left the meeting' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
