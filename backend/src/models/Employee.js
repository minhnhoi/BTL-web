const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: { type: Number, default: null, index: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    status: { type: String, default: 'Đang làm', trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    joinDate: { type: String, default: '' },
    avatar: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Employee', employeeSchema);
