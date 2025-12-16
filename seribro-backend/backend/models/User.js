const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'], // Hinglish: Email zaroori hai
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'], // Hinglish: Password zaroori hai
    minlength: 6,
    select: false, // Hinglish: Jab bhi user fetch hoga, password nahi dikhega
  },
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],
    required: [true, 'Role is required'], // Hinglish: Role (student ya company ya admin) zaroori hai
  },
  emailVerified: {
    type: Boolean,
    default: false, // Hinglish: Shuru mein email verified nahi hoga
  },
  // Hinglish: Phase-2 ke liye profile completion status, abhi false hi rahega
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String, // Hinglish: Password reset ke liye token
  resetPasswordExpire: Date, // Hinglish: Token ki expiry date

  // Hinglish: Device/Session tracking ke liye array
  devices: [{
    userAgent: { type: String },
    ip: { type: String },
    loggedInAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true, // Hinglish: Kab bana aur kab update hua, yeh track karega
});

// Pre-save hook to hash password (Hinglish: Save hone se pehle password ko hash karna)
UserSchema.pre('save', async function (next) {
  // Agar password modify nahi hua hai, toh aage badho (Hinglish: If password is not modified, move on)
  if (!this.isModified('password')) {
    return next();
  }

  // Password hash karna (Hinglish: Hashing the password)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password (Hinglish: Password compare karne ka method)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // Hinglish: Entered password ko stored hashed password se compare karna
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;