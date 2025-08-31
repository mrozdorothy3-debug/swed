require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  // Force cloud database connection
  const uri = process.env.MONGODB_URI || 'mongodb+srv://cjnr598:sweedbit_insuranceRu59vPIpeZUghsRD@cluster2.ppuzmmc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2';
  
  console.log('🔍 Using connection string:', uri.replace(/:\/\/[^@]+@/, '://***:***@'));
  
  try {
    console.log('🌐 Connecting to cloud database...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-insurance-api',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    const users = await User.find({}).select('username email firstName lastName role isActive account.balance').lean();
    console.log(`\n✅ Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('📝 No users found in cloud database');
    } else {
      console.log('\n👥 Users in cloud database:');
      console.log('═'.repeat(60));
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.username})`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log(`   ⚡ Active: ${user.isActive}`);
        console.log(`   💰 Balance: $${user.account?.balance || 0}`);
        console.log('─'.repeat(40));
      });
    }

    // Check specifically for Teresa
    const teresa = await User.findOne({ 
      $or: [
        { firstName: { $regex: /teresa/i } },
        { lastName: { $regex: /teresa/i } },
        { username: { $regex: /teresa/i } },
        { email: { $regex: /teresa/i } }
      ]
    });

    if (teresa) {
      console.log('\n🎯 Teresa found!');
      console.log(`   Name: ${teresa.firstName} ${teresa.lastName}`);
      console.log(`   Username: ${teresa.username}`);
      console.log(`   Email: ${teresa.email}`);
      console.log(`   Role: ${teresa.role}`);
      console.log(`   Balance: $${teresa.account?.balance || 0}`);
    } else {
      console.log('\n❌ Teresa not found in cloud database');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from cloud database');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cloud database check failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
