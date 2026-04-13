const Professor = require('../models/professor');

exports.listProfessors = async (req, res) => {
  try {
    const { department, q } = req.query;
    const query = {};
    if (department) query.department = department;
    if (q) query.name = { $regex: q, $options: 'i' };

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

    const professor = await Professor.create({ name, department, subjects });
    return res.status(201).json({ professor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getProfessorById = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ message: 'Professor not found' });
    return res.json({ professor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateProfessor = async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!professor) return res.status(404).json({ message: 'Professor not found' });
    return res.json({ professor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteProfessor = async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);
    if (!professor) return res.status(404).json({ message: 'Professor not found' });
    return res.json({ message: 'Professor deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
