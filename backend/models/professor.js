const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  subjects: [
    {
      type: String,
      trim: true,
      maxlength: 80
    }
  ],
  averageRatings: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Professor', professorSchema, 'Professors');
