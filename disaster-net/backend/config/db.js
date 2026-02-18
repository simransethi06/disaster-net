// ============================================
// DATABASE CONFIGURATION
// ============================================
// ⚠️ REQUIRED SETUP:
// 1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
// 2. Create a new cluster (free tier available)
// 3. Create database user with password
// 4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
// 5. Get connection string and add to .env file
// 6. Replace <password> in connection string with your database password
// ============================================

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables!');
      console.error('Please add MONGODB_URI to your .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n🔧 TROUBLESHOOTING:');
    console.error('1. Check if MONGODB_URI is set in .env file');
    console.error('2. Verify your MongoDB credentials');
    console.error('3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('4. Check if the database user has proper permissions');
    process.exit(1);
  }
};

export default connectDB;