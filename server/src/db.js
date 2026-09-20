const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Fix stale indexes: drop any non-sparse unique index on shareToken
    // that may have been created by an older schema version.
    // The correct index (unique + sparse) is defined in the Mongoose schemas.
    const db = conn.connection.db;
    for (const collName of ['folders', 'notes']) {
      try {
        const coll = db.collection(collName);
        const indexes = await coll.indexes();
        for (const idx of indexes) {
          if (idx.key && idx.key.shareToken !== undefined && idx.unique && !idx.sparse) {
            console.log(`Dropping stale non-sparse unique index "${idx.name}" on ${collName}`);
            await coll.dropIndex(idx.name);
          }
        }
      } catch (e) {
        // Collection might not exist yet — that's fine
      }
    }

    // Ensure the correct indexes are created
    await mongoose.model('Folder').syncIndexes();
    await mongoose.model('Note').syncIndexes();
    console.log('Indexes synced');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
