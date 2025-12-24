// backend/utils/students/uploadToCloudinary.js
// Cloudinary upload utility - Phase 2.1

const cloudinary = require('../../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Upload file to Cloudinary and delete local file
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name (e.g., 'resumes', 'certificates')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<object>} - { public_id, secure_url }
 */
const uploadToCloudinary = async (filePath, folder, userId) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found at provided path');
        }

        const ext = path.extname(filePath).toLowerCase();
        const resourceType = ext === '.pdf' ? 'raw' : 'auto';

        const result = await cloudinary.uploader.upload(filePath, {
            folder: `seribro/${folder}`,
            public_id: `${userId}_${Date.now()}_${path.basename(filePath, path.extname(filePath))}`,
            resource_type: resourceType,
            timeout: 60000 // 60 second timeout
        });

        // Delete local file after successful upload
        fs.unlink(filePath, (err) => {
            if (err) console.warn('Warning: Could not delete local file:', err.message);
        });

        return {
            public_id: result.public_id,
            secure_url: result.secure_url
        };
    } catch (error) {
        // Clean up local file on error
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.warn('Warning: Could not delete local file after error:', err.message);
            });
        }

        console.error('Cloudinary Upload Error:', error);
        throw new Error(`File upload failed: ${error.message || 'Unknown error'}`);
    }
};

module.exports = { uploadToCloudinary };