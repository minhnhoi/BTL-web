const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const Activity = require('../models/Activity');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

function getUserDisplayName(user) {
  return user.name || user.username || `User ${user.id}`;
}

async function getNextLeaveRequestId() {
  const last = await LeaveRequest.findOne().sort({ id: -1 }).select('id');
  return last ? last.id + 1 : 1;
}

function calculateDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(ms / 86400000) + 1);
}

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const leaves = await LeaveRequest.find(filter).sort({ id: -1 });
    res.json(leaves);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const type = String(req.body.type || '').trim();
    const from = String(req.body.from || '').trim();
    const to = String(req.body.to || '').trim();
    const reason = String(req.body.reason || '').trim();
    const days = Number(req.body.days || calculateDays(from, to));

    if (!type || !from || !to) {
      res.status(400);
      throw new Error('Vui lòng nhập loại nghỉ, ngày bắt đầu và ngày kết thúc.');
    }

    if (!Number.isFinite(days) || days < 0.5) {
      res.status(400);
      throw new Error('Số ngày nghỉ không hợp lệ.');
    }

    const leave = await LeaveRequest.create({
      id: await getNextLeaveRequestId(),
      userId: req.user.id,
      name: getUserDisplayName(req.user),
      type,
      from,
      to,
      days,
      reason,
      status: 'Chờ duyệt',
    });

    await Activity.create({ userId: req.user.id, text: `Gửi đơn xin nghỉ phép: ${type}`, icon: '📝' });
    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Chờ duyệt', 'Đã duyệt', 'Từ chối'].includes(status)) {
      res.status(400);
      throw new Error('Trạng thái nghỉ phép không hợp lệ.');
    }

    const leave = await LeaveRequest.findOneAndUpdate(
      { id: Number(req.params.id) },
      { status },
      { new: true },
    );

    if (!leave) {
      res.status(404);
      throw new Error('Không tìm thấy đơn nghỉ phép.');
    }

    await Activity.create({ userId: req.user.id, text: `${status} đơn nghỉ phép của ${leave.name}`, icon: status === 'Đã duyệt' ? '✅' : '❌' });
    res.json(leave);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
