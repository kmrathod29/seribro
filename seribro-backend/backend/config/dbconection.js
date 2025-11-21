// config/dbconnection.js

const mongoose = require('mongoose');

// Connect to MongoDB 🚀
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      
    });

    console.log(`📌✅💥 MongoDB Connected successfully`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;
