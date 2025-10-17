require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-password-reset',
    });
    
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Find Janey's account
    const janey = await User.findOne({ username: 'janeyblankenship' });
    
    if (!janey) {
      console.error('❌ Could not find Janey Blankenship account!');
      process.exit(1);
    }
    
    console.log(`Found Janey's account:`);
    console.log(`- Username: ${janey.username}`);
    console.log(`- Full Name: ${janey.firstName} ${janey.lastName}`);
    console.log(`- Email: ${janey.email}`);
    console.log(`- Status: ${janey.isActive ? 'Active' : 'Inactive'}`);
    
    // Reset password
    const newPassword = 'Customer123!';
    janey.password = newPassword;
    await janey.save();
    
    console.log(`\n✅ Password has been reset successfully!`);
    console.log(`\n🔑 New Login Details:`);
    console.log(`Full Name: ${janey.firstName} ${janey.lastName}`);
    console.log(`Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();