const Professor = require('../models/professor');
const {
  isValidObjectId,
  validateDepartment,
  validateProfessorName,
  validateSubjects,
} = require('../utils/validation');

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.listProfessors = async (req, res) => {
  try {
    const { department, q } = req.query;
    const query = {};
    if (department) query.department = department;
    if (q) query.name = { $regex: escapeRegExp(q.trim()), $options: 'i' };

    const professors = await Professor.find(query).sort({ name: 1 });
    return res.json({ professors });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createProfessor = async (req, res) => {
  try {
    const { name, department, subjects = [] } = req.body;
    if (!name || !department) {
      return res.status(400).json({ message: 'name and department are required' });
    }
    const nameError = validateProfessorName(name);
    if (nameError) {
      return res.status(400).json({ message: nameError });
    }
    const departmentError = validateDepartment(department);
    if (departmentError) {
      return res.status(400).json({ message: departmentError });
    }
    const subjectResult = validateSubjects(subjects);
    if (subjectResult.error) {
      return res.status(400).json({ message: subjectResult.error });
    }

    const professor = await Professor.create({
      name: String(name).trim(),
      department: String(department).trim(),
      subjects: subjectResult.value,
    });
    return res.status(201).json({ professor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getProfessorById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Professor not found' });
    }
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ message: 'Professor not found' });
    return res.json({ professor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateProfessor = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    const updates = {};
    if (req.body.name !== undefined) {
      const nameError = validateProfessorName(req.body.name);
      if (nameError) return res.status(400).json({ message: nameError });
      updates.name = String(req.body.name).trim();
    }
    if (req.body.department !== undefined) {
      const departmentError = validateDepartment(req.body.department);
      if (departmentError) return res.status(400).json({ message: departmentError });
      updates.department = String(req.body.department).trim();
    }
    if (req.body.subjects !== undefined) {
      const subjectResult = validateSubjects(req.body.subjects);
      if (subjectResult.error) return res.status(400).json({ message: subjectResult.error });
      updates.subjects = subjectResult.value;
    }

    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after' }
    );
    if (!professor) return res.status(404).json({ message: 'Professor not found' });
    return res.json({ professor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteProfessor = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Professor not found' });
    }
    const professor = await Professor.findByIdAndDelete(req.params.id);
    if (!professor) return res.status(404).json({ message: 'Professor not found' });
    return res.json({ message: 'Professor deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
