const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, downloadFile, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/:meetingId', protect, getFiles);
router.get('/download/:id', protect, downloadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
