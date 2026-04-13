const express = require('express');
const protect = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const {
  listUsers,
  warnUser,
  setBanStatus,
  listActions,
  listReports,
  updateReportStatus,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/users', listUsers);
router.post('/users/:id/warn', warnUser);
router.patch('/users/:id/ban', setBanStatus);
router.get('/actions', listActions);
router.get('/reports', listReports);
router.patch('/reports/:id/status', updateReportStatus);

module.exports = router;
