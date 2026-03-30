const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  subjects: [
    {
      type: String
    }
  ],
  averageRatings: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Professor', professorSchema, 'Professors');