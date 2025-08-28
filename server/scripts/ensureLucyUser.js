require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweedbit_insurance';
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const firstName = 'Lucy';
    const lastName = 'harrold';
    const email = 'lucy.harrold@example.com';
    const plainPassword = '$$LUCYharrold001';
    const balance = 27980;
    const transferFee = 1500;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const password = await bcrypt.hash(plainPassword, 12);
      user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        role: 'customer',
        account: { balance, transferFee },
        emailVerified: true,
        isActive: true
      });
      console.log(JSON.stringify({ success: true, created: true, message: 'Lucy created', id: user._id, email: user.email, account: user.account }, null, 2));
    } else {
      user.account = { ...user.account, balance, transferFee };
      // set password only if not set; keep existing to avoid unintended override
      if (!user.password) user.password = plainPassword;
      await user.save();
      console.log(JSON.stringify({ success: true, created: false, message: 'Lucy updated', id: user._id, email: user.email, account: user.account }, null, 2));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Ensure Lucy failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();

