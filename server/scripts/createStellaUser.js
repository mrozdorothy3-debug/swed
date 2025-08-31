require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  // Use cloud database connection
  const uri = process.env.MONGODB_URI || 'mongodb+srv://cjnr598:sweedbit_insuranceRu59vPIpeZUghsRD@cluster2.ppuzmmc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2';
  
  try {
    console.log('🌐 Connecting to database...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      appName: 'sweedbit-insurance-api',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Stella's details
    const userDetails = {
      firstName: 'Stella',
      lastName: 'Carson', 
      username: 'stella',
      email: 'stella.carson@example.com',
      password: '$PStell00125',
      phone: '+15550125',
      role: 'customer',
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
      address: { 
        city: 'Phoenix', 
        state: 'AZ', 
        country: 'United States' 
      },
      account: { 
        balance: 183209, 
        transferFee: 3300 
      },
      preferences: { 
        language: 'en', 
        timezone: 'America/Phoenix', 
        notifications: { 
          email: true, 
          sms: true, 
          push: true 
        } 
      },
    };

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: userDetails.email },
        { username: userDetails.username }
      ]
    });

    if (existingUser) {
      console.log('⚠️  User already exists:');
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Balance: $${existingUser.account?.balance || 0}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create new user
    const newUser = await User.create(userDetails);

    console.log('\n🎉 Successfully created new user:');
    console.log('═'.repeat(50));
    console.log(`👤 Name: ${newUser.firstName} ${newUser.lastName}`);
    console.log(`🔑 Username: ${newUser.username}`);
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`👨‍💼 Role: ${newUser.role}`);
    console.log(`⚡ Active: ${newUser.isActive}`);
    console.log(`💰 Balance: $${newUser.account.balance.toLocaleString()}`);
    console.log(`💸 Transfer Fee: $${newUser.account.transferFee.toLocaleString()}`);
    console.log(`🏠 Location: ${newUser.address.city}, ${newUser.address.state}`);
    console.log('═'.repeat(50));

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create user:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
