const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedInProcess() {
  try {
    console.log('🌱 Seeding in-memory database with 2 users (Neil & Lucy)...');

    await User.deleteMany({});

    const createOrUpdate = async (username, defaults) => {
      const found = await User.findOne({ username });
      if (found) {
        Object.assign(found, defaults);
        await found.save();
        return found;
      }
      return User.create(defaults);
    };

    await createOrUpdate('neil', {
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

    await createOrUpdate('lucy', {
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

    console.log('🎉 In-process seeding complete. Users: neil, lucy');
  } catch (err) {
    console.error('❌ In-process seeding failed:', err);
  }
}

module.exports = { seedInProcess };

