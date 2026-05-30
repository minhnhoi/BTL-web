const bcrypt = require('bcryptjs');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Activity = require('../models/Activity');
const data = require('./data');

async function seedCollection(Model, records) {
  const count = await Model.countDocuments();
  if (count > 0) return false;
  await Model.insertMany(records);
  return true;
}

async function seedDatabase({ force = false } = {}) {
  if (force) {
    await Promise.all([
      Department.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      User.deleteMany({}),
      Activity.deleteMany({}),
    ]);
  }

  const usersWithHash = await Promise.all(
    data.users.map(async (user) => ({
      ...user,
      passwordHash: await bcrypt.hash(user.password, 10),
      password: undefined,
    })),
  );

  const results = await Promise.all([
    seedCollection(Department, data.departments),
    seedCollection(Employee, data.employees),
    seedCollection(Attendance, data.attendance),
    seedCollection(LeaveRequest, data.leaveRequests),
    seedCollection(User, usersWithHash),
    seedCollection(Activity, data.activities),
  ]);

  await User.updateMany(
    { approvalStatus: { $exists: false } },
    { $set: { approvalStatus: 'approved', approvedAt: new Date() } },
  );

  const departments = await Department.find();
  await Promise.all(
    departments.map(async (department) => {
      const count = await Employee.countDocuments({ department: department.name, status: { $ne: 'Đã nghỉ' } });
      department.count = count;
      return department.save();
    }),
  );

  if (results.some(Boolean) || force) {
    console.log('Seed database completed.');
  }
}

module.exports = seedDatabase;
