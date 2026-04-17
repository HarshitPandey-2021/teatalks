const express = require('express');
const protect = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const {
  getOverview,
  listFlaggedContent,
  listUsers,
  warnUser,
  setBanStatus,
  listActions,
  listReports,
  updateReportStatus,
  updateContentModeration,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/overview', getOverview);
router.get('/flagged-content', listFlaggedContent);
router.get('/users', listUsers);
router.post('/users/:id/warn', warnUser);
router.patch('/users/:id/ban', setBanStatus);
router.get('/actions', listActions);
router.get('/reports', listReports);
router.patch('/reports/:id/status', updateReportStatus);
router.patch('/content/:id/moderation', updateContentModeration);

module.exports = router;
