require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    
    const users = await User.find({}).select('username email firstName lastName role isActive account.balance').lean();
    console.log(`\n✅ Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('📝 No users found in database');
    } else {
      console.log('\n👥 Users in database:');
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
    } else {
      console.log('\n❌ Teresa not found in database');
    }

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ User check failed:', err.message);
    try { await disconnectDB(); } catch {}
    process.exit(1);
  }
})();
