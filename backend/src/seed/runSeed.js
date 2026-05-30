require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const seedDatabase = require('./seedDatabase');

(async () => {
  try {
    await connectDB();
    await seedDatabase({ force: true });
    console.log('Đã reset và seed dữ liệu mẫu thành công.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
