const mongoose = require('mongoose');

let mongoServer = null; // only used in dev when using the in-memory server

async function connectDB() {
  const isProd = process.env.NODE_ENV === 'production';
  const shouldUseMemory = process.env.USE_IN_MEMORY_DB === 'true' || (!process.env.MONGODB_URI && !isProd);

  try {
    let uri = process.env.MONGODB_URI;

    if (shouldUseMemory) {
      // Lazy-require so production deployments don't need this package
      const { MongoMemoryServer } = require('mongodb-memory-server');

      const instanceOptions = {};
      if (process.env.MEMORY_DB_PATH) {
        instanceOptions.instance = {
          dbName: 'sweedbit_insurance',
          storageEngine: 'wiredTiger',
          dbPath: process.env.MEMORY_DB_PATH,
        };
      }

      mongoServer = await MongoMemoryServer.create(instanceOptions);
      uri = mongoServer.getUri('sweedbit_insurance');
      console.log(`🧪 Using in-memory MongoDB at ${uri}`);
    } else {
      if (!uri) {
        throw new Error('MONGODB_URI is required in production');
      }
      // Prefer 127.0.0.1 over localhost when connecting to local mongod to avoid IPv6 (::1) issues
      uri = uri.replace('mongodb://localhost', 'mongodb://127.0.0.1');
    }

    const conn = await mongoose.connect(uri, {
      // Modern Mongoose (v7/8) does not require useNewUrlParser/useUnifiedTopology
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: process.env.APP_NAME || 'sweedbit-insurance-api',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Ensure critical indexes (tolerate if they already exist)
    try {
      const db = mongoose.connection.db;
      await db.collection('users').createIndex({ email: 1 }, { name: 'email_1', unique: true });
      await db.collection('users').createIndex({ username: 1 }, { name: 'username_1', unique: true });
      await db.collection('policies').createIndex({ policyNumber: 1 }, { name: 'policyNumber_1', unique: true });
      await db.collection('claims').createIndex({ claimNumber: 1 }, { name: 'claimNumber_1', unique: true });
      console.log('✅ Database indexes ensured');
    } catch (err) {
      const isConflict = err?.codeName === 'IndexOptionsConflict' || err?.code === 85 || /same name|already exists/i.test(err?.message || '');
      if (isConflict) {
        console.log('ℹ️ Indexes already exist; continuing');
      } else {
        console.error('❌ Index creation error:', err.message);
      }
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    if (isProd) {
      // In production, fail fast so the orchestrator can restart us
      process.exitCode = 1;
      return;
    }

    console.log('\n💡 To fix this:');
    console.log('   1. Start a local MongoDB instance or');
    console.log('   2. Set MONGODB_URI to an Atlas connection string or');
    console.log('   3. Set USE_IN_MEMORY_DB=true to use an in-memory DB (dev only)');
    console.log('\n🔄 Retrying connection in 5 seconds...');

    setTimeout(() => {
      console.log('🔄 Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error.message);
  }
}

module.exports = { connectDB, disconnectDB };
