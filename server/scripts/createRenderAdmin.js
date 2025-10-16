// This script creates an admin user on the deployed Render server
// Access MongoDB directly using the environment variables on the server

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    // The MONGODB_URI is set in the Render environment variables
    const uri = process.env.MONGODB_URI;
    
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-admin-setup',
    });
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'masteradmin' });
    
    if (existingAdmin) {
      console.log('Master Admin already exists!');
      console.log('Username: masteradmin');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('\nYou can login with:');
      console.log('Full Name: Master Admin');
      console.log('Password: (the password you set)');
    } else {
      // Create master admin user with strong password
      const adminUser = await User.create({
        firstName: 'Master',
        lastName: 'Admin',
        username: 'masteradmin',
        email: 'masteradmin@sweedbit.com',
        password: 'MasterAdmin2025!', // strong password with special char, number, and uppercase
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
      
      console.log('✅ Master Admin created successfully on Render!');
      console.log('\n🔑 Master Admin Credentials:');
      console.log('Full Name: Master Admin');  // This is what you use to login
      console.log('Password: MasterAdmin2025!');
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      
      console.log('\n🌟 This Master Admin has full system access:');
      console.log('- Create/edit/delete users (customers, agents, admins)');
      console.log('- Manage user roles and permissions');
      console.log('- Access all system features');
    }
    
    console.log('\n🎯 You can now login at https://swed-1nye.onrender.com with these credentials');
    
  } catch (err) {
    console.error('Setup failed:', err.message);
    console.error(err);
  } finally {
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }
})();