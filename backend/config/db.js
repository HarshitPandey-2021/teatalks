const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB || 'TeaTalks';

    await mongoose.connect(uri, { dbName });
    console.log(`MongoDB Connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
