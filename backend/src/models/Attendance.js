const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: { type: Number, index: true, default: null },
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    checkIn: { type: String, default: '--' },
    checkOut: { type: String, default: '--' },
    status: { type: String, default: 'Đúng giờ', trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Attendance', attendanceSchema);
