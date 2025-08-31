require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweedbit_insurance';
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find({}).select('username email firstName lastName role isActive account.balance').lean();
    console.log(`Total users found: ${users.length}`);
    console.log('Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.username})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Balance: $${user.account?.balance || 0}`);
      console.log('---');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('User check failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
