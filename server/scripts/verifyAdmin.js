const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/database');

const verifyAdminUser = async () => {
  try {
    await connectDB();
    console.log('🔗 Connected to database');
    
    // Find admin user
    const adminUser = await User.findOne({ username: 'admin' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('ID:', adminUser._id);
    console.log('Username:', adminUser.username);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Is Active:', adminUser.isActive);
    console.log('Email Verified:', adminUser.emailVerified);
    console.log('Password Hash Length:', adminUser.password.length);
    
    // Test password comparison
    console.log('\n🔐 Testing password verification:');
    
    const testPasswords = ['admin123', 'Admin123', 'ADMIN123'];
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await adminUser.comparePassword(testPassword);
        console.log(`Password "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        // Also test direct bcrypt comparison
        const directMatch = await bcrypt.compare(testPassword, adminUser.password);
        console.log(`Direct bcrypt "${testPassword}": ${directMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        if (isMatch || directMatch) {
          console.log(`\n🎯 CORRECT CREDENTIALS:`);
          console.log(`Username: admin`);
          console.log(`Password: ${testPassword}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error testing "${testPassword}":`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to verify admin user:', error);
  } finally {
    await disconnectDB();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  verifyAdminUser();
}

module.exports = verifyAdminUser;
