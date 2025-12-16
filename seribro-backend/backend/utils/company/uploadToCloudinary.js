// uploadToCloudinary.js
// File ko Cloudinary par upload karne ka utility function

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * File ko Cloudinary par upload karta hai.
 * @param {string} filePath - Local file ka path.
 * @param {string} folder - Cloudinary par target folder.
 * @returns {Promise<{ url: string, publicId: string }>} - Uploaded file ka URL aur Public ID.
 */
const uploadToCloudinary = async (filePath, folder) => {
    try {
        // Cloudinary par upload karna
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder, // Kis folder mein save karna hai
            resource_type: 'auto', // File type automatically detect karega
        });

        // Upload successful hone par result return karna
        return {
            url: result.secure_url, // Secure URL
            publicId: result.public_id, // Public ID
        };
    } catch (error) {
        // Agar koi error aaye to
        console.error('Cloudinary upload mein error aaya:', error); // Error log karna
        throw new Error('File upload nahi ho paya. Kripya dobara prayas karein.'); // Hinglish mein error message
    } finally {
        // Temporary file ko hamesha delete karna hai
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // File delete kar di
            console.log(`Temporary file deleted: ${filePath}`); // Log karna
        }
    }
};

module.exports = { uploadToCloudinary };
