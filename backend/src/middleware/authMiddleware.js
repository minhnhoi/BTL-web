const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401);
      throw new Error('Bạn cần đăng nhập để sử dụng chức năng này.');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = await User.findOne({ id: payload.id });

    if (!user) {
      res.status(401);
      throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
    }

    if (user.role !== 'admin' && user.approvalStatus !== 'approved') {
      res.status(403);
      throw new Error('Tài khoản chưa được admin duyệt hoặc đã bị từ chối.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (!res.statusCode || res.statusCode < 400) res.status(401);
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    return next(new Error('Chỉ tài khoản admin mới có quyền thực hiện chức năng này.'));
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
