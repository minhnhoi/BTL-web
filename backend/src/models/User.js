const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true,
    },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: Number, default: null },
    rejectedAt: { type: Date, default: null },
    rejectedBy: { type: Number, default: null },
    rejectReason: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    position: { type: String, default: '', trim: true },
    employeeId: { type: Number, default: null, index: true },
    bio: { type: String, default: '' },
    avatar: { type: String, default: null },
  },
  { timestamps: true },
);

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
