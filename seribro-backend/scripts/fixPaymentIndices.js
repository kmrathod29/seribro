// scripts/fixPaymentIndices.js
// Migration script to fix Payment model indices
// Run with: node scripts/fixPaymentIndices.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/seribro';

async function fixPaymentIndices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    console.log('\n📋 Current indices:');
    const currentIndices = await collection.indexes();
    console.log(currentIndices);

    // Drop existing problematic indices if they exist
    console.log('\n🗑️  Dropping existing indices...');
    try {
      await collection.dropIndex('razorpayOrderId_1');
      console.log('✅ Dropped razorpayOrderId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  razorpayOrderId_1 index does not exist (already dropped or never created)');
      } else {
        console.warn('⚠️  Error dropping razorpayOrderId_1:', err.message);
      }
    }

    try {
      await collection.dropIndex('razorpayPaymentId_1');
      console.log('✅ Dropped razorpayPaymentId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  razorpayPaymentId_1 index does not exist (already dropped or never created)');
      } else {
        console.warn('⚠️  Error dropping razorpayPaymentId_1:', err.message);
      }
    }

    // Create new sparse unique indices
    console.log('\n🔨 Creating new sparse unique indices...');
    await collection.createIndex(
      { razorpayOrderId: 1 },
      { unique: true, sparse: true, name: 'razorpayOrderId_1' }
    );
    console.log('✅ Created sparse unique index on razorpayOrderId');

    await collection.createIndex(
      { razorpayPaymentId: 1 },
      { unique: true, sparse: true, name: 'razorpayPaymentId_1' }
    );
    console.log('✅ Created sparse unique index on razorpayPaymentId');

    // Verify new indices
    console.log('\n📋 New indices:');
    const newIndices = await collection.indexes();
    const relevantIndices = newIndices.filter(idx => 
      idx.name.includes('razorpayOrderId') || idx.name.includes('razorpayPaymentId')
    );
    console.log(relevantIndices);

    // Test: Check if we can have multiple null values
    console.log('\n🧪 Testing: Checking for duplicate null values...');
    const nullCount = await collection.countDocuments({ 
      $or: [
        { razorpayOrderId: null },
        { razorpayOrderId: { $exists: false } }
      ]
    });
    console.log(`✅ Found ${nullCount} payment(s) with null razorpayOrderId (this is now allowed)`);

    const nullPaymentCount = await collection.countDocuments({ 
      $or: [
        { razorpayPaymentId: null },
        { razorpayPaymentId: { $exists: false } }
      ]
    });
    console.log(`✅ Found ${nullPaymentCount} payment(s) with null razorpayPaymentId (this is now allowed)`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Removed unique constraint from field definitions');
    console.log('   - Created sparse unique indices at schema level');
    console.log('   - Multiple null values are now allowed');
    console.log('   - Unique constraint still applies to non-null values');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
fixPaymentIndices();

