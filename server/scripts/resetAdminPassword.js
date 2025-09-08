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
    const newPassword = 'admin123';

    const user = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!user) {
      console.log(JSON.stringify({ success: false, message: `Admin user not found for email ${adminEmail}` }, null, 2));
      await mongoose.disconnect();
      process.exit(1);
    }

    user.password = newPassword; // triggers pre('save') hashing
    await user.save();

    console.log(JSON.stringify({ 
      success: true, 
      message: 'Admin password reset to: admin123', 
      userId: user._id, 
      email: user.email,
      username: user.username
    }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Reset admin password failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
