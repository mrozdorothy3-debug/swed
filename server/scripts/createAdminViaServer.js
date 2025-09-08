const mongoose = require('mongoose');

// Since the running server might be using in-memory DB, let's create admin user directly
const createAdminForRunningServer = async () => {
  try {
    // Use the exact same connection logic as the running server
    const isProd = process.env.NODE_ENV === 'production';
    const shouldUseMemory = process.env.USE_IN_MEMORY_DB === 'true' || (!process.env.MONGODB_URI && !isProd);
    
    let uri = process.env.MONGODB_URI;
    
    if (shouldUseMemory || !uri) {
      console.log('❌ Server is using in-memory DB. You need to:');
      console.log('1. Stop your server (Ctrl+C)');
      console.log('2. Run this script');
      console.log('3. Restart your server');
      console.log('');
      console.log('OR use one of these test credentials:');
      console.log('');
      console.log('🔑 EXISTING CUSTOMER CREDENTIALS:');
      console.log('Username: neil');
      console.log('Password: $Neil$savinGGOD11$$');
      console.log('Role: customer');
      console.log('');
      console.log('Username: lucy');
      console.log('Password: $$LUCYharrold001');
      console.log('Role: customer');
      return;
    }
    
    // Connect to Atlas
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
    });
    
    console.log('✅ Connected to Atlas');
    
    // Import models after connection
    const User = require('../models/User');
    
    // Check existing users
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists in Atlas!');
      console.log('Username: admin');
      console.log('Password: admin123');
      return;
    }
    
    // Create admin
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      username: 'admin',
      email: 'admin@bwank.com',
      password: 'admin123',
      phone: '+15550100',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      address: {
        street: '123 Admin St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      account: { balance: 0, transferFee: 0 },
      preferences: {
        notifications: { email: true, sms: true, push: true },
        language: 'en',
        timezone: 'America/New_York'
      }
    });
    
    console.log('✅ Admin user created in Atlas!');
    console.log('🔑 ADMIN CREDENTIALS:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
      console.log('');
      console.log('🔄 Atlas connection failed. Your server is likely using in-memory DB.');
      console.log('Here are working credentials for your current setup:');
      console.log('');
      console.log('🔑 CUSTOMER CREDENTIALS (these should work):');
      console.log('Username: neil');
      console.log('Password: $Neil$savinGGOD11$$');
      console.log('Role: customer (limited access)');
      console.log('');
      console.log('Username: lucy'); 
      console.log('Password: $$LUCYharrold001');
      console.log('Role: customer (limited access)');
      console.log('');
      console.log('💡 To create admin user:');
      console.log('1. Stop your server');
      console.log('2. Run: npm run seed');
      console.log('3. Restart your server immediately');
      console.log('4. Then login with: admin / admin123');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ Disconnected');
    }
  }
};

createAdminForRunningServer();
