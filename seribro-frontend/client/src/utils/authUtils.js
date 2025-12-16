// utils/authUtils.js (Hinglish: User data ko cookie se read/write karne ka utility)

// Hinglish: User data ko cookie mein save karta hai
export const saveUserToCookie = (userData) => {
  try {
    // Hinglish: User data ko JSON stringify karke 'user' naam ki cookie mein save karna
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
    document.cookie = `user=${JSON.stringify(userData)};expires=${expires.toUTCString()};path=/;`;
    return true;
  } catch (error) {
    console.error("Error saving user to cookie:", error);
    return false;
  }
};

// Hinglish: 'user' cookie se data nikalta hai
export const getLoggedInUser = () => {
  const nameEQ = 'user=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      const userDataString = cookie.substring(nameEQ.length);
      try {
        return JSON.parse(userDataString);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
        return null;
      }
    }
  }
  return null;
};

// Hinglish: User ko logout karta hai (cookie aur token delete karke)
export const logoutUser = () => {
  // Delete user cookie
  document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  
  // Delete JWT token from localStorage
  localStorage.removeItem('jwtToken');
  
  // Clear any other auth-related data
  localStorage.removeItem('authToken');
  sessionStorage.clear();
};