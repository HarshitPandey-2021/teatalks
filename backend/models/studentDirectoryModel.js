const mongoose = require('mongoose');

const studentDirectorySchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('StudentDirectory', studentDirectorySchema, 'StudentDirectory');
