const bcrypt = require('bcryptjs');

// Generate admin password hash
const generateAdminPasswordHash = async () => {
  const password = 'Admin@123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('='.repeat(60));
  console.log('ADMIN PASSWORD HASH GENERATOR');
  console.log('='.repeat(60));
  console.log('\n📝 Plain Password:', password);
  console.log('\n🔐 Bcrypt Hashed Password:', hashedPassword);
  console.log('\n💾 Use this hash in your JSON when inserting into MongoDB:');
  console.log(`\n"password": "${hashedPassword}"`);
  
  console.log('\n📋 Complete JSON to paste in MongoDB Atlas:');
  console.log(`
{
  "email": "admin@seribro.com",
  "password": "${hashedPassword}",
  "role": "admin",
  "emailVerified": true,
  "profileCompleted": true,
  "devices": [],
  "createdAt": new Date(),
  "updatedAt": new Date()
}
  `);
  console.log('='.repeat(60));
};

generateAdminPasswordHash();
