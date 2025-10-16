require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const uri = process.env.MONGODB_URI;
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-admin-setup',
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
    } else {
      // Create admin user
      const adminUser = await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        username: 'admin',
        email: 'admin@sweedbit.com',
        password: 'Admin123!', // more secure password
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
          balance: 10000, // starting with some balance
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
      console.log('Password: Admin123!');
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
    }
    
    // Create a regular user
    const existingUser = await User.findOne({ username: 'user1' });
    
    if (existingUser) {
      console.log('\nRegular user already exists!');
      console.log('Username:', existingUser.username);
      console.log('Email:', existingUser.email);
    } else {
      const regularUser = await User.create({
        firstName: 'Regular',
        lastName: 'User',
        username: 'user1',
        email: 'user@sweedbit.com',
        password: 'User123!',
        phone: '+15551234',
        role: 'customer',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        address: {
          street: '456 User Ave',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'United States'
        },
        account: {
          balance: 5000,
          transferFee: 1.5
        },
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: false
          },
          language: 'en',
          timezone: 'America/Chicago'
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0
        }
      });
      
      console.log('\n✅ Regular user created successfully!');
      console.log('Username: user1');
      console.log('Password: User123!');
      console.log('Email:', regularUser.email);
    }

    console.log('\n🎯 You can now login at http://localhost:3000 with these credentials');
    
  } catch (err) {
    console.error('Setup failed:', err.message);
  } finally {
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }
})();