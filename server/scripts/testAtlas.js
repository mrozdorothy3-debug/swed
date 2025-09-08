require('dotenv').config();
const mongoose = require('mongoose');

const testAtlasConnection = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('🔗 Testing MongoDB Atlas connection...');
    console.log('URI:', uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'NOT SET');
    
    if (!uri) {
      console.log('❌ MONGODB_URI not found in .env file');
      return;
    }
    
    console.log('\n⏳ Connecting to Atlas...');
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // Wait longer for Atlas
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    console.log('✅ SUCCESS! Connected to MongoDB Atlas:', conn.connection.host);
    console.log('Database name:', conn.connection.name);
    
    // Test creating a simple document
    const testCollection = mongoose.connection.db.collection('test');
    const testDoc = await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Test document created:', testDoc.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: testDoc.insertedId });
    console.log('✅ Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
    console.log('\n🎉 Atlas connection is working perfectly!');
    console.log('Your server should be able to connect to Atlas.');
    
  } catch (error) {
    console.error('❌ Atlas connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network issue - check your internet connection');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication issue - check your username/password in MONGODB_URI');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Timeout issue - Atlas might be slow or blocked by firewall');
    }
    
    console.log('\nFalling back to local MongoDB or in-memory DB...');
  }
};

testAtlasConnection();
