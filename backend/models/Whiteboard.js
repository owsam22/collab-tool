const mongoose = require('mongoose');

const strokeSchema = new mongoose.Schema({
  tool: { type: String, enum: ['pen', 'eraser', 'text', 'line', 'rect', 'circle'], default: 'pen' },
  color: { type: String, default: '#ffffff' },
  width: { type: Number, default: 2 },
  points: [{ x: Number, y: Number }],
  text: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const whiteboardSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
    },
    strokes: [strokeSchema],
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Whiteboard', whiteboardSchema);
