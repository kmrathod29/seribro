// backend/middleware/student/uploadMiddleware.js
// File upload handler for student documents - Phase 2.1

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: fieldname-timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = {
        resume: ['application/pdf'],
        collegeId: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        certificates: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    };

    const allowedTypes = allowedMimeTypes[file.fieldname];
    
    if (!allowedTypes) {
        return cb(new Error(`Invalid field name: ${file.fieldname}`), false);
    }

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const typeNames = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
        cb(new Error(`Only ${typeNames} files are allowed for ${file.fieldname}.`), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    }
});

// Custom middleware wrapper for error handling
const uploadMiddleware = (req, res, next) => {
    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return sendResponse(res, 400, false, `Upload error: ${err.message}`);
            } else if (err) {
                return sendResponse(res, 400, false, err.message);
            }
            next();
        });
    };
};

module.exports = { 
    uploadMiddleware: upload,
    getUploadInstance: () => upload
};