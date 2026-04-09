const mongoose = require('mongoose');

async function cleanupUserIndexes() {
  try {
    const usersCollection = mongoose.connection.db.collection('Users');
    const indexes = await usersCollection.indexes();
    const removableIndexes = new Set(['rollNumber_1', 'campusName_1']);

    for (const index of indexes) {
      if (removableIndexes.has(index.name)) {
        await usersCollection.dropIndex(index.name);
        console.log(`Dropped obsolete Users index: ${index.name}`);
      }
    }
  } catch (error) {
    if (error.codeName === 'NamespaceNotFound') {
      return;
    }
    throw error;
  }
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB || 'TeaTalks';

    await mongoose.connect(uri, { dbName });
    await cleanupUserIndexes();
    console.log(`MongoDB Connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
