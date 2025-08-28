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

    const email = 'neil.harryman@example.com';
    const newBalance = 31800;

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { 'account.balance': newBalance } },
      { new: true }
    ).lean();

    if (!user) {
      console.log(JSON.stringify({ success: false, message: `User not found for email ${email}` }, null, 2));
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(JSON.stringify({
      success: true,
      message: 'Neil balance updated',
      email: user.email,
      account: user.account
    }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Update Neil balance failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();

