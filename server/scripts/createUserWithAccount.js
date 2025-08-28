require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweedbit_insurance';
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const firstName = 'Neil';
    const lastName = 'harryman';
    const email = 'neil.harryman@example.com';
    const password = 'Temp12345!';

    // Check if user already exists by email
    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(JSON.stringify({
        success: true,
        message: 'User already exists',
        userId: existing._id,
        email: existing.email,
        account: existing.account || null
      }, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    }

    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'customer',
      account: {
        balance: 30000,
        transferFee: 3000
      },
      emailVerified: true,
      phoneVerified: false,
      isActive: true
    });

    await user.save();

    console.log(JSON.stringify({
      success: true,
      message: 'User created',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        account: user.account
      }
    }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Create user failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();

