require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAtlasWithAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('🌍 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    console.log('✅ Connected to Atlas');
    
    // Clear existing users (optional - remove if you want to keep existing data)
    console.log('🗑️ Clearing existing users...');
    await User.deleteMany({});
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      username: 'admin',
      email: 'admin@bwank.com',
      password: 'admin123',
      phone: '+15550100',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      address: {
        street: '123 Admin St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      account: { balance: 0, transferFee: 0 },
      preferences: {
        notifications: { email: true, sms: true, push: true },
        language: 'en',
        timezone: 'America/New_York'
      }
    });
    
    console.log('✅ Admin user created successfully!');
    
    // Create Neil customer
    console.log('👤 Creating Neil (customer)...');
    await User.create({
      firstName: 'Neil',
      lastName: 'Harryman',
      username: 'neil',
      email: 'neil.harryman@example.com',
      password: '$Neil$savinGGOD11$$',
      phone: '+15550123',
      role: 'customer',
      emailVerified: true,
      phoneVerified: true,
      address: { city: 'Dallas', state: 'TX', country: 'United States' },
      account: { balance: 30000, transferFee: 3000 },
      preferences: { language: 'en', timezone: 'America/Chicago', notifications: { email: true, sms: true, push: true } },
    });
    
    // Create Lucy customer
    console.log('👤 Creating Lucy (customer)...');
    await User.create({
      firstName: 'Lucy',
      lastName: 'Harrold',
      username: 'lucy',
      email: 'lucy.harrold@example.com',
      password: '$$LUCYharrold001',
      phone: '+15550124',
      role: 'customer',
      emailVerified: true,
      phoneVerified: true,
      address: { city: 'Seattle', state: 'WA', country: 'United States' },
      account: { balance: 27980, transferFee: 1500 },
      preferences: { language: 'en', timezone: 'America/Los_Angeles', notifications: { email: true, sms: true, push: false } },
    });
    
    console.log('\n🎉 Atlas database seeded successfully!');
    console.log('\n🔑 ADMIN CREDENTIALS:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n👥 Customer credentials:');
    console.log('Neil - Username: neil, Password: $Neil$savinGGOD11$$');
    console.log('Lucy - Username: lucy, Password: $$LUCYharrold001');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from Atlas');
    console.log('\n🚀 Now restart your server and login with admin/admin123');
    
  } catch (error) {
    console.error('❌ Error seeding Atlas:', error.message);
  }
};

seedAtlasWithAdmin();
