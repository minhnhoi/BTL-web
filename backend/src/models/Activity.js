const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, index: true },
    text: { type: String, required: true },
    icon: { type: String, default: '📝' },
    time: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

activitySchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    ret.time = ret.time ? ret.time.toISOString() : ret.createdAt.toISOString();
    return ret;
  },
});

module.exports = mongoose.model('Activity', activitySchema);
