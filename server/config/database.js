const mongoose = require('mongoose');
const User = require('../models/User');

// Function to ensure admin user exists
async function ensureAdminExists() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'masteradmin' });
    
    if (!existingAdmin) {
      // Create master admin user with strong password
      const adminUser = await User.create({
        firstName: 'Master',
        lastName: 'Admin',
        username: 'masteradmin',
        email: 'masteradmin@sweedbit.com',
        password: 'MasterAdmin2025!', // strong password
        phone: '+15550001',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        address: {
          street: '1 Admin Plaza',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        account: {
          balance: 1000000, 
          transferFee: 0
        },
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          language: 'en',
          timezone: 'America/New_York'
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0
        }
      });
      
      console.log('\n✅ Master Admin created automatically!');
      console.log('Full Name: Master Admin'); // This is what you use to login
      console.log('Password: MasterAdmin2025!');
      console.log('Email:', adminUser.email);
      console.log('\n🔑 Login with these credentials to manage users');
    } else {
      console.log('\n✅ Master Admin already exists - Login with Full Name: Master Admin');
    }
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  }
}

let mongoServer = null; // only used in dev when using the in-memory server

async function connectDB() {
  const isProd = process.env.NODE_ENV === 'production';
  const forceMemory = process.env.USE_IN_MEMORY_DB === 'true';
  const uri = process.env.MONGODB_URI;

  try {
    let connectionUri;

    // Only use in-memory if explicitly requested
    if (forceMemory) {
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
      connectionUri = mongoServer.getUri('sweedbit_insurance');
      console.log(`🧪 Using in-memory MongoDB at ${connectionUri}`);
    } else if (uri) {
      // Use Atlas/external MongoDB
      connectionUri = uri.replace('mongodb://localhost', 'mongodb://127.0.0.1');
      console.log(`🌍 Connecting to MongoDB Atlas...`);
    } else {
      throw new Error('MONGODB_URI is required when not using in-memory DB');
    }

    const conn = await mongoose.connect(connectionUri, {
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
      
      // Create default admin user if it doesn't exist
      await ensureAdminExists();
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
