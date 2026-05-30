const express = require('express');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentTimeString() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getUserDisplayName(user) {
  return user.name || user.username || `User ${user.id}`;
}

async function getNextAttendanceId() {
  const last = await Attendance.findOne().sort({ id: -1 }).select('id');
  return last ? last.id + 1 : 1;
}

function getStatusFromCheckIn(checkIn) {
  if (!checkIn || checkIn === '--') return 'Chưa chấm công';
  const [hour, minute] = checkIn.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 'Đúng giờ';
  const totalMinutes = hour * 60 + minute;
  return totalMinutes > 8 * 60 + 15 ? 'Đi muộn' : 'Đúng giờ';
}

router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.date) {
      filter.date = String(req.query.date);
    }

    if (req.user.role !== 'admin') {
      filter.userId = req.user.id;
    }

    const attendance = await Attendance.find(filter).sort({ date: -1, id: 1 });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

router.post('/check-in', async (req, res, next) => {
  try {
    const date = String(req.body.date || getTodayString()).slice(0, 10);
    const checkIn = getCurrentTimeString();

    let record = await Attendance.findOne({ userId: req.user.id, date });

    if (record && record.checkIn && record.checkIn !== '--') {
      res.status(409);
      throw new Error('Bạn đã chấm công vào trong ngày này rồi.');
    }

    if (!record) {
      record = await Attendance.create({
        id: await getNextAttendanceId(),
        userId: req.user.id,
        name: getUserDisplayName(req.user),
        date,
        checkIn,
        checkOut: '--',
        status: getStatusFromCheckIn(checkIn),
      });
    } else {
      record.name = getUserDisplayName(req.user);
      record.checkIn = checkIn;
      record.status = getStatusFromCheckIn(checkIn);
      await record.save();
    }

    await Activity.create({ userId: req.user.id, text: `Chấm công vào lúc ${checkIn}`, icon: '🕘' });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.post('/check-out', async (req, res, next) => {
  try {
    const date = String(req.body.date || getTodayString()).slice(0, 10);
    const checkOut = getCurrentTimeString();

    const record = await Attendance.findOne({ userId: req.user.id, date });

    if (!record || !record.checkIn || record.checkIn === '--') {
      res.status(400);
      throw new Error('Bạn cần chấm công vào trước khi chấm công ra.');
    }

    if (record.checkOut && record.checkOut !== '--') {
      res.status(409);
      throw new Error('Bạn đã chấm công ra trong ngày này rồi.');
    }

    record.checkOut = checkOut;
    await record.save();

    await Activity.create({ userId: req.user.id, text: `Chấm công ra lúc ${checkOut}`, icon: '🏁' });
    res.json(record);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
