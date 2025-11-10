// src/utils/authUtils.js

/**
 * Set a cookie with name, value, and optional expiration days
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 7)
 */
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

/**
 * Get a cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Save user data to cookie
 * @param {Object} userData - User object with firstName, lastName, email, userType
 */
export const saveUserToCookie = (userData) => {
  try {
    const userJson = JSON.stringify(userData);
    setCookie('user', userJson, 7); // Store for 7 days
    return true;
  } catch (error) {
    console.error('Error saving user to cookie:', error);
    return false;
  }
};

/**
 * Get user data from cookie
 * @returns {Object|null} - User object or null if not found
 */
export const getUserFromCookie = () => {
  try {
    const userCookie = getCookie('user');
    if (userCookie) {
      return JSON.parse(userCookie);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
};

/**
 * Check if user is logged in
 * @returns {boolean} - True if user cookie exists
 */
export const isUserLoggedIn = () => {
  return getCookie('user') !== null;
};

/**
 * Logout user - delete user cookie
 */
export const logoutUser = () => {
  deleteCookie('user');
};

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  setCookie('authToken', token, 7);
};

/**
 * Get authentication token
 * @returns {string|null} - Token or null
 */
export const getAuthToken = () => {
  return getCookie('authToken');
};

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  deleteCookie('authToken');
};