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

    // Admin user details - Using "Admin User" as the full name for login
    const adminDetails = {
      firstName: 'Admin',
      lastName: 'User', 
      username: 'admin',
      email: 'admin@atlasinsurance.com',
      password: 'password123',
      role: 'admin',
      emailVerified: true,
      phoneVerified: false,
      isActive: true,
      account: { 
        balance: 0, 
        transferFee: 0 
      }
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminDetails.email },
        { username: adminDetails.username },
        { firstName: 'Admin', lastName: 'User' }
      ]
    });

    if (existingAdmin) {
      // Update existing admin
      existingAdmin.firstName = adminDetails.firstName;
      existingAdmin.lastName = adminDetails.lastName;
      existingAdmin.username = adminDetails.username;
      existingAdmin.email = adminDetails.email;
      existingAdmin.password = adminDetails.password; // Will be hashed by pre-save hook
      existingAdmin.role = adminDetails.role;
      existingAdmin.isActive = true;
      
      await existingAdmin.save();
      
      console.log('\n✅ Admin user updated successfully!');
      console.log('═'.repeat(50));
      console.log(`👤 Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`🔑 Username: ${existingAdmin.username}`);
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👨‍💼 Role: ${existingAdmin.role}`);
      console.log(`⚡ Active: ${existingAdmin.isActive}`);
    } else {
      // Create new admin
      const newAdmin = await User.create(adminDetails);

      console.log('\n🎉 Admin user created successfully!');
      console.log('═'.repeat(50));
      console.log(`👤 Name: ${newAdmin.firstName} ${newAdmin.lastName}`);
      console.log(`🔑 Username: ${newAdmin.username}`);
      console.log(`📧 Email: ${newAdmin.email}`);
      console.log(`👨‍💼 Role: ${newAdmin.role}`);
      console.log(`⚡ Active: ${newAdmin.isActive}`);
    }

    console.log('\n🚨 LOGIN CREDENTIALS:');
    console.log('═'.repeat(30));
    console.log(`Full Name: Admin User`);
    console.log(`Password: password123`);
    console.log('\n💡 Use "Admin User" (full name) to login!');

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create/update admin:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
