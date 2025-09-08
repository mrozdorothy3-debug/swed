const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/database');

const createAdminUser = async () => {
  try {
    await connectDB();
    console.log('🔗 Connected to database');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Username: admin');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }
    
    // Create admin user
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
      account: {
        balance: 0,
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
    
    console.log('✅ Admin user created successfully!');
    console.log('\n🔑 Admin Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('\n🎯 You can now login at http://localhost:3000 with these credentials');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  } finally {
    await disconnectDB();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
