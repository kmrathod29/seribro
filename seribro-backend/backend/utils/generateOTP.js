// utils/generateOTP.js (Hinglish: OTP generate karne ka utility)

// Hinglish: 6-digit ka random number generate karta hai
const generateOTP = () => {
  // Math.random() se 0 aur 1 ke beech ka number aata hai
  // * 900000 se 0 se 899999 tak ki range milti hai
  // + 100000 se 100000 se 999999 tak ki range milti hai (6 digits)
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateOTP;