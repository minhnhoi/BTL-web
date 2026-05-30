const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: { type: Number, index: true, default: null },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    days: { type: Number, required: true, min: 0.5 },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'], default: 'Chờ duyệt' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
