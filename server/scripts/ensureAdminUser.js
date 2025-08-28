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

    const adminEmail = 'admin@atlasinsurance.com';
    const password = 'password123';

    let user = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!user) {
      user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail.toLowerCase(),
        password,
        role: 'admin',
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      });
      await user.save();
      console.log(JSON.stringify({ success: true, created: true, message: 'Admin user created', userId: user._id, email: user.email }, null, 2));
    } else {
      user.password = password; // triggers pre('save') hashing
      if (user.role !== 'admin') user.role = 'admin';
      user.isActive = true;
      await user.save();
      console.log(JSON.stringify({ success: true, created: false, message: 'Admin user updated', userId: user._id, email: user.email }, null, 2));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Ensure admin failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();

