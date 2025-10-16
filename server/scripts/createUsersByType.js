require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createUsers() {
  const uri = process.env.MONGODB_URI;
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-users-setup',
    });
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Create a few insurance agents
    const agents = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        username: 'sarahj',
        email: 'sarah.johnson@sweedbit.com',
        password: 'Agent123!',
        phone: '+15551234',
        role: 'agent',
        account: { balance: 0, transferFee: 0 }
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        username: 'michaelc',
        email: 'michael.chen@sweedbit.com',
        password: 'Agent123!',
        phone: '+15552345',
        role: 'agent',
        account: { balance: 0, transferFee: 0 }
      }
    ];
    
    // Create a few customers
    const customers = [
      {
        firstName: 'Emma',
        lastName: 'Williams',
        username: 'emmaw',
        email: 'emma.williams@example.com',
        password: 'Customer123!',
        phone: '+15553456',
        role: 'customer',
        account: { balance: 8500, transferFee: 1.5 }
      },
      {
        firstName: 'James',
        lastName: 'Brown',
        username: 'jamesb',
        email: 'james.brown@example.com',
        password: 'Customer123!',
        phone: '+15554567',
        role: 'customer',
        account: { balance: 12000, transferFee: 1.5 }
      },
      {
        firstName: 'Olivia',
        lastName: 'Garcia',
        username: 'oliviag',
        email: 'olivia.garcia@example.com',
        password: 'Customer123!',
        phone: '+15555678',
        role: 'customer',
        account: { balance: 3500, transferFee: 1.5 }
      }
    ];
    
    console.log('Creating agents and customers...');
    
    // Process agents
    for (const agentData of agents) {
      const exists = await User.findOne({ username: agentData.username });
      if (exists) {
        console.log(`Agent ${agentData.firstName} ${agentData.lastName} already exists`);
        continue;
      }
      
      const agent = await User.create({
        ...agentData,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        address: {
          street: '123 Agency St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'United States'
        },
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          language: 'en',
          timezone: 'America/Chicago'
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0
        }
      });
      
      console.log(`✅ Created agent: ${agent.firstName} ${agent.lastName} (${agent.username})`);
    }
    
    // Process customers
    for (const customerData of customers) {
      const exists = await User.findOne({ username: customerData.username });
      if (exists) {
        console.log(`Customer ${customerData.firstName} ${customerData.lastName} already exists`);
        continue;
      }
      
      const customer = await User.create({
        ...customerData,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        address: {
          street: '456 Customer Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'United States'
        },
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: false
          },
          language: 'en',
          timezone: 'America/Los_Angeles'
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0
        }
      });
      
      console.log(`✅ Created customer: ${customer.firstName} ${customer.lastName} (${customer.username})`);
    }
    
    console.log('\n🎉 Successfully created sample users');
    
    // Display all users
    const allUsers = await User.find().select('firstName lastName username email role account.balance');
    
    console.log('\n📋 All users in the system:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.username})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Balance: $${user.account?.balance || 0}`);
      console.log('---');
    });
    
    console.log('\n🎯 You can now login as any of these users at http://localhost:3000');
    console.log('🔐 Use the username and password to login');
    console.log('👨‍💼 For agents and customers: password is "Agent123!" and "Customer123!" respectively');
    
  } catch (err) {
    console.error('Setup failed:', err.message);
  } finally {
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }
}

createUsers();