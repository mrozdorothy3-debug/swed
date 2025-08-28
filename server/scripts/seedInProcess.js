const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');

async function seedInProcess() {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`ℹ️ Seed detected: ${existingUsers} users already exist — ensuring demo users are present`);
    } else {
      console.log('🌱 Seeding in-memory database (same process)...');
    }

    const ensureUser = async (email, defaults) => {
      const found = await User.findOne({ email });
      if (found) {
        // Update password if provided (plain) and ensure account fields exist
        let changed = false;
        if (typeof defaults.password === 'string' && defaults.password.length > 0) {
          found.password = defaults.password; // pre-save hook will hash
          changed = true;
        }
        if (defaults.account) {
          found.account = { ...found.account, ...defaults.account };
          changed = true;
        }
        if (changed) await found.save();
        return found;
      }
      return User.create(defaults); // pre-save hook will hash password
    };

    // Create or ensure default admin user (plain password; model hashes it)
    const adminUser = await ensureUser('admin@atlasinsurance.com', {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@atlasinsurance.com',
      password: 'password123',
      phone: '+15550100',
      role: 'admin',
      emailVerified: true,
      phoneVerified: true,
      address: {
        street: '123 Insurance Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      preferences: {
        notifications: { email: true, sms: true, push: true },
        language: 'en',
        timezone: 'America/New_York'
      }
    });

    const agentUser = await ensureUser('agent@atlasinsurance.com', {
      firstName: 'John',
      lastName: 'Smith',
      email: 'agent@atlasinsurance.com',
      password: 'agent123',
      phone: '+15550101',
      role: 'agent',
      emailVerified: true,
      phoneVerified: true,
      address: {
        street: '456 Agent Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      preferences: {
        notifications: { email: true, sms: false, push: true },
        language: 'en',
        timezone: 'America/Los_Angeles'
      }
    });

    const customerUser = await ensureUser('customer@atlasinsurance.com', {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'customer@atlasinsurance.com',
      password: 'customer123',
      phone: '+15550102',
      role: 'customer',
      emailVerified: true,
      phoneVerified: true,
      dateOfBirth: new Date('1990-05-15'),
      address: {
        street: '789 Customer St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'United States'
      },
      preferences: {
        notifications: { email: true, sms: true, push: false },
        language: 'en',
        timezone: 'America/Chicago'
      },
      account: { balance: 125000, transferFee: 3000 }
    });

    const autoPolicy = await Policy.create({
      policyType: 'auto',
      status: 'active',
      customer: customerUser._id,
      agent: agentUser._id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      premium: { amount: 1200, frequency: 'monthly', nextDueDate: new Date('2024-12-01') },
      coverage: {
        limits: { liability: 50000, property: 25000, medical: 10000, uninsured: 25000 },
        deductibles: { collision: 500, comprehensive: 250 },
        features: [
          { name: 'Roadside Assistance', description: '24/7 roadside assistance coverage', additionalCost: 50 },
          { name: 'Rental Car Coverage', description: 'Rental car reimbursement up to $30/day', additionalCost: 75 },
        ],
      },
      insuredItems: [
        { type: 'vehicle', details: { make: 'Toyota', model: 'Camry', year: 2020, vin: '1HGBH41JXMN109186', color: 'Silver' }, value: 25000 },
      ],
    });

    await Policy.create({
      policyType: 'home',
      status: 'active',
      customer: customerUser._id,
      agent: agentUser._id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      premium: { amount: 1800, frequency: 'annually', nextDueDate: new Date('2025-01-01') },
      coverage: {
        limits: { property: 300000, liability: 100000, medical: 5000 },
        deductibles: { property: 1000 },
        features: [ { name: 'Identity Theft Protection', description: 'Identity theft coverage up to $25,000', additionalCost: 100 } ],
      },
      insuredItems: [ { type: 'property', details: { address: '789 Customer St', city: 'Chicago', state: 'IL', zipCode: '60601', yearBuilt: 1995, squareFootage: 2500 }, value: 350000 } ],
    });

    await Claim.create({
      policy: autoPolicy._id,
      customer: customerUser._id,
      agent: agentUser._id,
      type: 'auto',
      status: 'approved',
      priority: 'medium',
      incidentDate: new Date('2024-06-15'),
      description: 'Minor fender bender in parking lot. No injuries reported.',
      estimatedAmount: 2500,
      approvedAmount: 2300,
      paidAmount: 2300,
      deductible: 500,
      location: { address: '123 Main St', city: 'Chicago', state: 'IL', zipCode: '60601' },
      parties: [ { name: 'Sarah Johnson', type: 'insured', contact: { phone: '+1-555-0102', email: 'customer@atlasinsurance.com' }, statement: 'I was backing out of a parking spot when I hit another car.' } ],
    });

    // Ensure Neil Harryman (demo account used by /accounts fallback)
    await ensureUser('neil.harryman@example.com', {
      firstName: 'Neil',
      lastName: 'Harryman',
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

    // Ensure Lucy Harrold (for your demo login)
    await ensureUser('lucy.harrold@example.com', {
      firstName: 'Lucy',
      lastName: 'Harrold',
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

    console.log('🎉 In-process seeding complete. Default accounts:');
    console.log(' - Admin: admin@atlasinsurance.com / password123');
    console.log(' - Agent: agent@atlasinsurance.com / agent123');
    console.log(' - Customer: customer@atlasinsurance.com / customer123');
    console.log(' - Neil: neil.harryman@example.com (custom password)');
    console.log(' - Lucy: lucy.harrold@example.com (custom password)');
  } catch (err) {
    console.error('❌ In-process seeding failed:', err);
  }
}

module.exports = { seedInProcess };

