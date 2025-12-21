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

// Decode JWT payload without external libs; returns payload object or null
export const decodeJwtPayload = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(payload)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(decoded);
  } catch (err) {
    console.error('decodeJwtPayload error', err);
    return null;
  }
};

// Read canonical token from localStorage and return minimal user object { email, role, ... }
export const getAuthFromLocalToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    // Map expected fields
    return {
        fullName: payload.name || payload.fullName || null,
        email: payload.email || payload.userEmail || null,
        role: payload.role || null,
        // keep token available if callers want it
        _token: token,
    };
  } catch (err) {
    console.error('getAuthFromLocalToken error', err);
    return null;
  }
};

// Hinglish: User ko logout karta hai (cookie aur token delete karke)
export const logoutUser = () => {
  // Delete user cookie
  document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  
  // Delete JWT token from localStorage
  localStorage.removeItem('token');
  // keep backward compatibility
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('authToken');
  sessionStorage.clear();
  // Notify app that auth changed
  try { window.dispatchEvent(new Event('authChanged')); } catch { /* ignore */ }
};