require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    // Get connection URI from environment
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-account-checker',
    });
    
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Query all users
    const users = await User.find({}).sort({ role: 1, username: 1 }).lean();
    
    console.log(`\n\n📋 Found ${users.length} total accounts:`);
    
    // Group users by role
    const roles = {};
    
    users.forEach(user => {
      const role = user.role || 'unknown';
      if (!roles[role]) {
        roles[role] = [];
      }
      roles[role].push(user);
    });
    
    // Print admin accounts first (detailed)
    if (roles['admin']) {
      console.log(`\n🔐 Admin Accounts: ${roles['admin'].length}`);
      console.log(`=====================`);
      
      roles['admin'].forEach((admin, index) => {
        console.log(`${index + 1}. Username: ${admin.username}`);
        console.log(`   Full Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Created: ${admin.createdAt ? new Date(admin.createdAt).toLocaleString() : 'Unknown'}`);
        console.log(`   Last Updated: ${admin.updatedAt ? new Date(admin.updatedAt).toLocaleString() : 'Unknown'}`);
        console.log(`   Account Balance: $${admin.account?.balance || 0}`);
        console.log(`---`);
      });
    }
    
    // Print agent accounts
    if (roles['agent']) {
      console.log(`\n👨‍💼 Agent Accounts: ${roles['agent'].length}`);
      console.log(`=====================`);
      
      roles['agent'].forEach((agent, index) => {
        console.log(`${index + 1}. Username: ${agent.username}`);
        console.log(`   Full Name: ${agent.firstName} ${agent.lastName}`);
        console.log(`   Email: ${agent.email}`);
        console.log(`   Status: ${agent.isActive ? 'Active' : 'Inactive'}`);
        console.log(`---`);
      });
    }
    
    // Print customer accounts
    if (roles['customer']) {
      console.log(`\n👤 Customer Accounts: ${roles['customer'].length}`);
      console.log(`=====================`);
      
      roles['customer'].forEach((customer, index) => {
        console.log(`${index + 1}. Username: ${customer.username}`);
        console.log(`   Full Name: ${customer.firstName} ${customer.lastName}`);
        console.log(`   Email: ${customer.email}`);
        console.log(`   Status: ${customer.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Account Balance: $${customer.account?.balance || 0}`);
        console.log(`---`);
      });
    }
    
    // Print any other role types
    Object.keys(roles).forEach(role => {
      if (!['admin', 'agent', 'customer'].includes(role)) {
        console.log(`\n⚠️ ${role} Accounts: ${roles[role].length}`);
        console.log(`=====================`);
        
        roles[role].forEach((user, index) => {
          console.log(`${index + 1}. Username: ${user.username}`);
          console.log(`   Full Name: ${user.firstName} ${user.lastName}`);
          console.log(`   Email: ${user.email}`);
          console.log(`---`);
        });
      }
    });
    
    console.log(`\n✅ Account check complete`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();