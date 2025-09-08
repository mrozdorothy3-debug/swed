const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/database');

const listAndCreateAdmin = async () => {
  try {
    await connectDB();
    console.log('🔗 Connected to database');
    
    // List all users
    const allUsers = await User.find({}).select('+password');
    console.log(`\n📋 Found ${allUsers.length} users in database:`);
    
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
    });
    
    // Check if admin exists
    const adminUser = allUsers.find(user => user.username === 'admin');
    
    if (adminUser) {
      console.log('\n✅ Admin user already exists!');
      
      // Test the password
      console.log('\n🔐 Testing admin password...');
      try {
        const isMatch = await adminUser.comparePassword('admin123');
        console.log(`Password "admin123": ${isMatch ? '✅ WORKS' : '❌ DOES NOT WORK'}`);
        
        if (isMatch) {
          console.log('\n🎯 CORRECT ADMIN CREDENTIALS:');
          console.log('Username: admin');
          console.log('Password: admin123');
        } else {
          // Try to reset the password
          console.log('\n🔄 Resetting admin password...');
          adminUser.password = 'admin123';
          await adminUser.save();
          console.log('✅ Admin password reset to: admin123');
        }
      } catch (error) {
        console.error('❌ Error testing password:', error);
      }
    } else {
      console.log('\n➕ Creating new admin user...');
      
      const newAdmin = await User.create({
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
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('\n🎯 ADMIN CREDENTIALS:');
      console.log('Username: admin');
      console.log('Password: admin123');
    }
    
    console.log('\n📖 All available login credentials:');
    const updatedUsers = await User.find({});
    updatedUsers.forEach(user => {
      if (user.username === 'admin') {
        console.log(`- Username: admin, Password: admin123 (Role: ${user.role})`);
      } else if (user.username === 'neil') {
        console.log(`- Username: neil, Password: $Neil$savinGGOD11$$ (Role: ${user.role})`);
      } else if (user.username === 'lucy') {
        console.log(`- Username: lucy, Password: $$LUCYharrold001 (Role: ${user.role})`);
      } else {
        console.log(`- Username: ${user.username} (Role: ${user.role})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  listAndCreateAdmin();
}

module.exports = listAndCreateAdmin;
