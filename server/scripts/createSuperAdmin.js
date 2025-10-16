require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const uri = process.env.MONGODB_URI;
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-superadmin-setup',
    });
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ username: 'superadmin' });
    
    if (existingAdmin) {
      console.log('SuperAdmin user already exists!');
      console.log('Username: superadmin');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
    } else {
      // Create super admin user
      const superAdminUser = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        username: 'superadmin',
        email: 'superadmin@sweedbit.com',
        password: 'SuperAdmin123!', // secure password with special char
        phone: '+15550101',
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
          balance: 1000000, // 1 million starting balance
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
      
      console.log('✅ SuperAdmin user created successfully!');
      console.log('\n🔑 SuperAdmin Credentials:');
      console.log('Username: superadmin');
      console.log('Password: SuperAdmin123!');
      console.log('Email:', superAdminUser.email);
      console.log('Role:', superAdminUser.role);
      
      console.log('\n🌟 This SuperAdmin has full system access:');
      console.log('- Create/edit/delete users (customers, agents, admins)');
      console.log('- Manage user roles and permissions');
      console.log('- Access all system features');
    }
    
    console.log('\n🎯 You can now login at http://localhost:3000 with these credentials');
    
  } catch (err) {
    console.error('Setup failed:', err.message);
  } finally {
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }
})();