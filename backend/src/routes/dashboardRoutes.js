const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Activity = require('../models/Activity');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const today = req.query.date || '2026-05-22';
    const [totalEmployees, totalDepartments, onLeave, attendanceToday, latestActivities] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      LeaveRequest.countDocuments({ status: 'Chờ duyệt' }),
      Attendance.countDocuments({ date: today, status: { $ne: 'Nghỉ phép' } }),
      Activity.find().sort({ time: -1, createdAt: -1 }).limit(4),
    ]);

    res.json({
      stats: [
        { label: 'Tổng nhân viên', value: String(totalEmployees), colorClass: 'text-primary' },
        { label: 'Phòng ban', value: String(totalDepartments), colorClass: 'text-success' },
        { label: 'Đang nghỉ phép', value: String(onLeave), colorClass: 'text-warning' },
        { label: 'Chấm công hôm nay', value: String(attendanceToday), colorClass: 'text-purple' },
      ],
      recentActivity: latestActivities.length
        ? latestActivities.map((item) => item.text)
        : [
            'Nguyễn Văn A đã gửi đơn xin nghỉ phép.',
            'Phòng Kỹ thuật cập nhật danh sách nhân viên.',
            'Chấm công ngày 22/05 đã được ghi nhận.',
            'Trần Thị B được thêm vào phòng Marketing.',
          ],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
