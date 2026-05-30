const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Activity = require('../models/Activity');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

function cleanText(value) {
  return String(value || '').trim();
}

function formatDateVN(date = new Date()) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

async function findUserByIdParam(req) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return null;
  return User.findOne({ id });
}

function canAccessUser(req, user) {
  return req.user.role === 'admin' || req.user.id === user.id;
}

async function getNextEmployeeId() {
  const last = await Employee.findOne().sort({ id: -1 }).select('id');
  return last ? last.id + 1 : 1;
}

async function getNextDepartmentId() {
  const last = await Department.findOne().sort({ id: -1 }).select('id');
  return last ? last.id + 1 : 1;
}

async function ensureDepartment(name) {
  const cleanName = cleanText(name) || 'Chưa phân phòng ban';
  let department = await Department.findOne({ name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (!department) {
    department = await Department.create({
      id: await getNextDepartmentId(),
      name: cleanName,
      manager: 'Chưa phân công',
      count: 0,
      description: 'Phòng ban được tạo tự động khi duyệt tài khoản nhân viên.',
      color: '#0d6efd',
      createdAtText: new Date().toISOString().slice(0, 10),
    });
  }
  return department;
}

async function syncDepartmentCount(departmentName) {
  const cleanName = cleanText(departmentName);
  if (!cleanName) return;
  const count = await Employee.countDocuments({ department: cleanName, status: { $ne: 'Đã nghỉ' } });
  await Department.updateOne({ name: cleanName }, { $set: { count } });
}

async function createOrUpdateEmployeeFromUser(user) {
  if (!user || user.role !== 'employee' || user.approvalStatus !== 'approved') return null;

  const department = cleanText(user.department) || 'Chưa phân phòng ban';
  await ensureDepartment(department);

  let employee = null;
  if (user.employeeId) {
    employee = await Employee.findOne({ id: user.employeeId });
  }
  if (!employee) {
    employee = await Employee.findOne({ userId: user.id });
  }

  const payload = {
    userId: user.id,
    name: cleanText(user.name) || user.username,
    department,
    position: cleanText(user.position) || 'Nhân viên',
    status: 'Đang làm',
    email: cleanText(user.email),
    phone: cleanText(user.phone),
    avatar: user.avatar || null,
  };

  if (!employee) {
    employee = await Employee.create({
      id: await getNextEmployeeId(),
      ...payload,
      joinDate: formatDateVN(user.approvedAt || new Date()),
    });
    user.employeeId = employee.id;
    await user.save();
  } else {
    const oldDepartment = employee.department;
    Object.assign(employee, payload);
    if (!employee.joinDate) employee.joinDate = formatDateVN(user.approvedAt || new Date());
    await employee.save();
    if (oldDepartment && oldDepartment !== employee.department) {
      await syncDepartmentCount(oldDepartment);
    }
  }

  await syncDepartmentCount(department);
  return employee;
}

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const status = cleanText(req.query.status);
    const filter = status ? { approvalStatus: status } : {};
    const users = await User.find(filter).sort({ createdAt: -1, id: -1 });
    res.json(users.map((user) => user.toSafeObject()));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/approve', requireAdmin, async (req, res, next) => {
  try {
    const user = await findUserByIdParam(req);
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy tài khoản.');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Không cần duyệt tài khoản admin.');
    }

    user.approvalStatus = 'approved';
    user.approvedAt = new Date();
    user.approvedBy = req.user.id;
    user.rejectedAt = null;
    user.rejectedBy = null;
    user.rejectReason = '';
    user.department = cleanText(user.department) || 'Chưa phân phòng ban';
    user.position = cleanText(user.position) || 'Nhân viên';
    user.bio = user.bio || 'Tài khoản đã được admin duyệt.';
    await user.save();

    const employee = await createOrUpdateEmployeeFromUser(user);

    await Activity.create({
      userId: user.id,
      text: employee
        ? `Tài khoản được duyệt và tự động thêm vào danh sách nhân viên (${employee.department})`
        : `Tài khoản được duyệt bởi ${req.user.username}`,
      icon: '✅',
    });

    res.json({
      message: employee
        ? 'Đã duyệt tài khoản và tự động thêm vào danh sách nhân viên.'
        : 'Đã duyệt tài khoản.',
      user: user.toSafeObject(),
      employee,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/reject', requireAdmin, async (req, res, next) => {
  try {
    const user = await findUserByIdParam(req);
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy tài khoản.');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Không thể từ chối tài khoản admin.');
    }

    user.approvalStatus = 'rejected';
    user.rejectedAt = new Date();
    user.rejectedBy = req.user.id;
    user.rejectReason = cleanText(req.body.reason) || 'Admin từ chối tài khoản.';
    user.approvedAt = null;
    user.approvedBy = null;
    await user.save();

    await Activity.create({ userId: user.id, text: `Tài khoản bị từ chối bởi ${req.user.username}`, icon: '❌' });
    res.json({ message: 'Đã từ chối tài khoản.', user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await findUserByIdParam(req);
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng.');
    }

    if (!canAccessUser(req, user)) {
      res.status(403);
      throw new Error('Bạn không có quyền xem tài khoản này.');
    }

    res.json(user.toSafeObject());
  } catch (error) {
    next(error);
  }
});

router.put('/:id/profile', async (req, res, next) => {
  try {
    const user = await findUserByIdParam(req);
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng.');
    }

    if (!canAccessUser(req, user)) {
      res.status(403);
      throw new Error('Bạn không có quyền sửa tài khoản này.');
    }

    const oldDepartment = user.department;
    const employeeSelfFields = ['name', 'email', 'phone', 'bio', 'avatar'];
    const adminFields = ['name', 'email', 'phone', 'department', 'position', 'bio', 'avatar'];
    const allowedFields = req.user.role === 'admin' ? adminFields : employeeSelfFields;

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === 'avatar') {
          user[field] = req.body[field] || null;
        } else {
          user[field] = cleanText(req.body[field]);
        }
      }
    });

    if (!user.name) {
      res.status(400);
      throw new Error('Họ tên không được để trống.');
    }

    await user.save();
    await createOrUpdateEmployeeFromUser(user);
    if (oldDepartment && oldDepartment !== user.department) {
      await syncDepartmentCount(oldDepartment);
    }

    res.json(user.toSafeObject());
  } catch (error) {
    next(error);
  }
});

router.put('/:id/password', async (req, res, next) => {
  try {
    const user = await findUserByIdParam(req);
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng.');
    }

    if (!canAccessUser(req, user)) {
      res.status(403);
      throw new Error('Bạn không có quyền đổi mật khẩu tài khoản này.');
    }

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400);
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    if (req.user.role !== 'admin' || req.user.id === user.id) {
      const isMatch = await bcrypt.compare(currentPassword || '', user.passwordHash);
      if (!isMatch) {
        res.status(400);
        throw new Error('Mật khẩu hiện tại không đúng.');
      }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/activities', async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      res.status(403);
      throw new Error('Bạn không có quyền xem lịch sử tài khoản này.');
    }

    const activities = await Activity.find({ userId }).sort({ time: -1, createdAt: -1 }).limit(30);
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/activities', async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      res.status(403);
      throw new Error('Bạn không có quyền thêm lịch sử tài khoản này.');
    }

    const activity = await Activity.create({
      userId,
      text: req.body.text,
      icon: req.body.icon || '📝',
    });
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/activities', async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      res.status(403);
      throw new Error('Bạn không có quyền xóa lịch sử tài khoản này.');
    }

    await Activity.deleteMany({ userId });
    res.json({ message: 'Đã xóa lịch sử hoạt động.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
