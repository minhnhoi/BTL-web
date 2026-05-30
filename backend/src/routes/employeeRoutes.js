const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const Employee = require('../models/Employee');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { name: new RegExp(search, 'i') },
            { department: new RegExp(search, 'i') },
            { position: new RegExp(search, 'i') },
          ],
        }
      : {};
    const employees = await Employee.find(filter).sort({ id: 1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ id: Number(req.params.id) });
    if (!employee) {
      res.status(404);
      throw new Error('Không tìm thấy nhân viên.');
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
