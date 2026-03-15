const File = require('../models/File');
const path = require('path');
const fs = require('fs');

// @desc    Upload a file to a meeting
// @route   POST /api/files/upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { meetingId } = req.body;
    if (!meetingId) {
      return res.status(400).json({ success: false, message: 'Meeting ID is required' });
    }

    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user._id,
      meeting: meetingId,
    });

    const populated = await File.findById(file._id).populate('uploadedBy', 'name email avatar');

    res.status(201).json({ success: true, file: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all files for a meeting
// @route   GET /api/files/:meetingId
exports.getFiles = async (req, res) => {
  try {
    const files = await File.find({ meeting: req.params.meetingId })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: files.length, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download a file
// @route   GET /api/files/download/:id
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Only uploader or admin can delete
    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file' });
    }

    // Delete from disk
    const filePath = path.resolve(file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(file._id);

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
