require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  // Use cloud database connection
  const uri = process.env.MONGODB_URI || 'mongodb+srv://cjnr598:sweedbit_insuranceRu59vPIpeZUghsRD@cluster2.ppuzmmc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2';
  
  try {
    console.log('🌐 Connecting to database...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-insurance-api',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Get ALL users (not filtered by role)
    const users = await User.find({}).select('username email firstName lastName role isActive account.balance').lean();
    console.log(`\n✅ Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('📝 No users found in database');
    } else {
      console.log('\n👥 All Users in database:');
      console.log('═'.repeat(70));
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (@${user.username || 'no-username'})`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log(`   ⚡ Active: ${user.isActive}`);
        console.log(`   💰 Balance: $${user.account?.balance || 0}`);
        console.log('─'.repeat(50));
      });
    }

    // Specifically check for admin user
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('\n🔑 ADMIN USER FOUND:');
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log('\n   🚨 LOGIN CREDENTIALS:');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password: password123`);
    } else {
      console.log('\n❌ No admin user found');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to check users:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
