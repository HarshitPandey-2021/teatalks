const express = require('express');
const protect = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const {
  listProfessors,
  createProfessor,
  getProfessorById,
  updateProfessor,
  deleteProfessor,
} = require('../controllers/professorController');

const router = express.Router();

router.get('/', listProfessors);
router.get('/:id', getProfessorById);
router.post('/', protect, requireAdmin, createProfessor);
router.patch('/:id', protect, requireAdmin, updateProfessor);
router.delete('/:id', protect, requireAdmin, deleteProfessor);

module.exports = router;
