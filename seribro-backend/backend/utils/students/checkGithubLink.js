// backend/utils/students/checkGithubLink.js
// GitHub link validator - Phase 2.1

const axios = require('axios');

/**
 * Validates GitHub repository link format
 * NOTE: Network check is disabled by default to avoid rate limits
 * @param {string} url - GitHub URL to validate
 * @returns {Promise<string|null>} - Error message or null if valid
 */
const checkGithubLink = async (url) => {
    try {
        // Basic URL validation
        if (!url || typeof url !== 'string') {
            return 'GitHub link must be a valid string.';
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'GitHub link must start with http:// or https://';
        }

        // Regex for GitHub repo format: github.com/username/repo
        const githubRepoRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/)?(\?.*)?(#[a-zA-Z0-9_-]+)?$/i;

        if (!githubRepoRegex.test(url)) {
            return 'Invalid GitHub repository format. Use: https://github.com/username/repository';
        }

        // Optional: Live check (uncomment if needed, but beware of rate limits)
        /*
        const response = await axios.head(url, { 
            timeout: 5000,
            maxRedirects: 5,
            validateStatus: (status) => status < 500 // Accept 404 as valid (private repo)
        });
        
        if (response.status === 404) {
            console.log('GitHub repo returned 404 (might be private):', url);
            // Don't block private repos, just log
        }
        */

        return null; // Validation successful
    } catch (error) {
        console.error('GitHub validation error:', error.message);
        // Don't block on network errors, just log
        return null; // Accept link despite network issues
    }
};

module.exports = { checkGithubLink };