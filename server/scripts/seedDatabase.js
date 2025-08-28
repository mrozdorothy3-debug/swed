const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const { connectDB, disconnectDB } = require('../config/database');

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Policy.deleteMany({});
    await Claim.deleteMany({});
    
    console.log('🗑️  Cleared existing data');

    // Only two customer users: Neil and Lucy
    const neilUser = await User.create({
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
    console.log('👤 Created customer user (Neil):', neilUser.username);

    const lucyUser = await User.create({
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
    console.log('👤 Created customer user (Lucy):', lucyUser.username);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Users created:');
    console.log(' - neil / $Neil$savinGGOD11$$');
    console.log(' - lucy / $$LUCYharrold001');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await disconnectDB();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
