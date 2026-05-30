const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    manager: { type: String, required: true, trim: true },
    count: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    color: { type: String, default: '#0d6efd' },
    createdAtText: { type: String, default: '' },
  },
  { timestamps: true },
);

departmentSchema.set('toJSON', {
  transform(doc, ret) {
    ret.createdAt = ret.createdAtText || (ret.createdAt ? ret.createdAt.toISOString().slice(0, 10) : '');
    delete ret.createdAtText;
    return ret;
  },
});

module.exports = mongoose.model('Department', departmentSchema);
