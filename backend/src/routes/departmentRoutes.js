const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const seedData = require('../seed/data');

const router = express.Router();

router.use(requireAuth, requireAdmin);

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getNextId() {
  const last = await Department.findOne().sort({ id: -1 });
  return last ? last.id + 1 : 1;
}

router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ id: 1 });
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/employees', async (req, res, next) => {
  try {
    const department = await Department.findOne({ id: Number(req.params.id) });
    if (!department) {
      res.status(404);
      throw new Error('Không tìm thấy phòng ban.');
    }

    const employees = await Employee.find({
      department: new RegExp(`^${escapeRegExp(department.name)}$`, 'i'),
    }).sort({ name: 1, id: 1 });

    const total = employees.length;
    if (department.count !== total) {
      department.count = total;
      await department.save();
    }

    res.json({ department, total, employees });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      manager: req.body.manager,
      count: Number(req.body.count || 0),
      description: req.body.description || '',
      color: req.body.color || '#0d6efd',
      createdAtText: new Date().toISOString().slice(0, 10),
    };

    if (!payload.name || !payload.manager) {
      res.status(400);
      throw new Error('Tên phòng ban và trưởng phòng là bắt buộc.');
    }

    const duplicated = await Department.findOne({ name: new RegExp(`^${escapeRegExp(payload.name)}$`, 'i') });
    if (duplicated) {
      res.status(409);
      throw new Error('Tên phòng ban đã tồn tại.');
    }

    const department = await Department.create({ id: await getNextId(), ...payload });
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const department = await Department.findOne({ id });

    if (!department) {
      res.status(404);
      throw new Error('Không tìm thấy phòng ban.');
    }

    const duplicated = await Department.findOne({
      id: { $ne: id },
      name: new RegExp(`^${escapeRegExp(req.body.name)}$`, 'i'),
    });
    if (duplicated) {
      res.status(409);
      throw new Error('Tên phòng ban đã tồn tại.');
    }

    department.name = req.body.name;
    department.manager = req.body.manager;
    department.count = Number(req.body.count || 0);
    department.description = req.body.description || '';
    department.color = req.body.color || '#0d6efd';

    await department.save();
    res.json(department);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const department = await Department.findOneAndDelete({ id: Number(req.params.id) });
    if (!department) {
      res.status(404);
      throw new Error('Không tìm thấy phòng ban.');
    }
    res.json({ message: 'Đã xóa phòng ban.', department });
  } catch (error) {
    next(error);
  }
});

router.post('/reset', async (req, res, next) => {
  try {
    await Department.deleteMany({});
    await Department.insertMany(seedData.departments);
    const departments = await Department.find().sort({ id: 1 });
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
