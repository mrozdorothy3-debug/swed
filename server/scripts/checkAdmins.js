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

    const admins = await User.find({ role: 'admin' }).select('email firstName lastName role').lean();
    console.log(JSON.stringify({ count: admins.length, admins }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Admin check failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();

