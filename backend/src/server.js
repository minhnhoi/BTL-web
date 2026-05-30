require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedDatabase');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRequestRoutes = require('./routes/leaveRequestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const healthHandler = (req, res) => {
  res.json({ ok: true, message: 'HRM backend is running' });
};

function mountRoutes(prefix) {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/departments`, departmentRoutes);
  app.use(`${prefix}/employees`, employeeRoutes);
  app.use(`${prefix}/attendance`, attendanceRoutes);
  app.use(`${prefix}/leave-requests`, leaveRequestRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
}

// Đường dẫn API chuẩn cho frontend hiện tại.
app.get('/api/health', healthHandler);
mountRoutes('/api');

// Hỗ trợ bản frontend/.env cũ đang gọi /auth/login thay vì /api/auth/login.
// Nhờ đó người dùng không bị lỗi đăng nhập khi chưa kịp đổi biến môi trường.
app.get('/health', healthHandler);
mountRoutes('');

app.use(notFound);
app.use(errorHandler);

(async () => {
  try {
    await connectDB();
    if (process.env.SEED_ON_START !== 'false') {
      await seedDatabase();
    }
    app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Không thể khởi động backend:', error.message);
    process.exit(1);
  }
})();
