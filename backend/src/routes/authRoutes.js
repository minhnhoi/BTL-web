const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Department = require('../models/Department');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'dev_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

async function getNextUserId() {
  const lastUser = await User.findOne().sort({ id: -1 }).select('id');
  return lastUser ? lastUser.id + 1 : 1;
}

function cleanText(value) {
  return String(value || '').trim();
}

router.get('/register-options', async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).select('id name');
    res.json({
      departments: departments.map((department) => ({
        id: department.id,
        name: department.name,
      })),
      positions: [
        'Nhân viên',
        'Thực tập sinh',
        'Chuyên viên',
        'Kỹ thuật viên',
        'Lập trình viên',
        'Kế toán viên',
        'Chuyên viên HR',
      ],
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error('Vui lòng nhập tài khoản và mật khẩu.');
    }

    const cleanUsername = String(username).trim();
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      res.status(401);
      throw new Error('Tài khoản hoặc mật khẩu không đúng.');
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      res.status(401);
      throw new Error('Tài khoản hoặc mật khẩu không đúng.');
    }

    if (user.role !== 'admin' && user.approvalStatus === 'pending') {
      res.status(403);
      throw new Error('Tài khoản đang chờ admin duyệt. Sau khi được duyệt bạn mới đăng nhập được.');
    }

    if (user.role !== 'admin' && user.approvalStatus === 'rejected') {
      res.status(403);
      throw new Error(user.rejectReason ? `Tài khoản đã bị từ chối: ${user.rejectReason}` : 'Tài khoản đã bị admin từ chối.');
    }

    await Activity.create({ userId: user.id, text: 'Đăng nhập hệ thống', icon: '🔑' });

    res.json({ user: user.toSafeObject(), token: createToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      name,
      email,
      phone,
      department,
      position,
      bio,
    } = req.body;
    const cleanUsername = cleanText(username);
    const cleanName = cleanText(name);
    const cleanDepartment = cleanText(department);
    const cleanPosition = cleanText(position) || 'Nhân viên';

    if (!cleanUsername || !password) {
      res.status(400);
      throw new Error('Vui lòng nhập tài khoản và mật khẩu.');
    }

    if (!cleanName) {
      res.status(400);
      throw new Error('Vui lòng nhập họ tên nhân viên.');
    }

    if (!cleanDepartment) {
      res.status(400);
      throw new Error('Vui lòng chọn phòng ban.');
    }

    if (cleanUsername.length < 3) {
      res.status(400);
      throw new Error('Tài khoản phải có ít nhất 3 ký tự.');
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      res.status(400);
      throw new Error('Tài khoản chỉ được dùng chữ, số, dấu gạch dưới, dấu chấm hoặc gạch ngang.');
    }

    if (String(password).length < 6) {
      res.status(400);
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400);
      throw new Error('Mật khẩu xác nhận không khớp.');
    }

    const existed = await User.findOne({ username: cleanUsername });
    if (existed) {
      res.status(409);
      throw new Error('Tài khoản này đã tồn tại.');
    }

    const user = await User.create({
      id: await getNextUserId(),
      username: cleanUsername,
      passwordHash: await bcrypt.hash(String(password), 10),
      name: cleanName,
      role: 'employee',
      approvalStatus: 'pending',
      email: cleanText(email),
      phone: cleanText(phone),
      department: cleanDepartment,
      position: cleanPosition,
      bio: cleanText(bio) || 'Tài khoản mới đăng ký, đang chờ admin duyệt.',
      avatar: null,
    });

    await Activity.create({ userId: user.id, text: 'Đăng ký tài khoản mới - chờ admin duyệt', icon: '🕒' });

    res.status(201).json({
      message: 'Đăng ký thành công. Tài khoản đang chờ admin duyệt, chưa thể đăng nhập ngay.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json(req.user.toSafeObject());
});

module.exports = router;
