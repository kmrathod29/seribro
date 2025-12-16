// uploadMiddleware.js
// Multer se file upload handle karne ka middleware

const multer = require('multer');
const path = require('path');
const {
    validateFileType,
    validateFileSize,
    MAX_LOGO_SIZE,
    MAX_DOCUMENT_SIZE,
    ALLOWED_LOGO_TYPES,
    ALLOWED_DOCUMENT_TYPES,
} = require('../../utils/company/validateFileHelpers');

// Temporary storage ke liye disk storage setup karna
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files ko 'uploads' folder mein store karna
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // File ka naam unique banana: fieldname-timestamp-original_name
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Logo upload ke liye Multer instance
const uploadLogo = multer({
    storage: storage,
    limits: {
        fileSize: MAX_LOGO_SIZE, // 2MB max
    },
    fileFilter: (req, file, cb) => {
        // Logo ke liye file type validation
        if (validateFileType(file.mimetype, ALLOWED_LOGO_TYPES)) {
            cb(null, true); // Agar valid hai to accept karna
        } else {
            // Agar invalid hai to error return karna
            cb(
                new Error(
                    'Logo sirf JPEG, PNG, ya WEBP format mein hona chahiye aur 2MB se kam hona chahiye.'
                ),
                false
            );
        }
    },
}).single('logo'); // 'logo' fieldname se single file expect karna

// Documents upload ke liye Multer instance
const uploadDocuments = multer({
    storage: storage,
    limits: {
        fileSize: MAX_DOCUMENT_SIZE, // Har file 3MB max
    },
    fileFilter: (req, file, cb) => {
        // Documents ke liye file type validation
        if (validateFileType(file.mimetype, ALLOWED_DOCUMENT_TYPES)) {
            cb(null, true); // Agar valid hai to accept karna
        } else {
            // Agar invalid hai to error return karna
            cb(
                new Error(
                    'Documents sirf PDF, JPEG, ya PNG format mein hone chahiye aur har file 3MB se kam honi chahiye.'
                ),
                false
            );
        }
    },
}).array('documents', 5); // 'documents' fieldname se max 5 files expect karna

module.exports = { uploadLogo, uploadDocuments };