// backend/middleware/workspaceUploadMiddleware.js
// Multer config for workspace message attachments with validation

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'workspace-messages');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `workspace-${uniqueSuffix}${ext}`);
    },
});

// Allowed file extensions
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.zip'];

// Allowed MIME types
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;

const uploadMessageFiles = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    fileFilter: (req, file, cb) => {
        // Check extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            return cb(
                new Error(`Invalid file type for '${file.originalname}': extension ${ext} not allowed. Allowed: ${allowedExtensions.join(', ')}`),
                false
            );
        }
        // Check MIME type
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new Error(`Invalid MIME type for '${file.originalname}': ${file.mimetype} not allowed`),
                false
            );
        }
        cb(null, true);
    },
}).array('attachments', MAX_FILES);

// Wrapper middleware to catch multer errors and return proper JSON response
const uploadMessageFilesWithErrorHandler = (req, res, next) => {
    uploadMessageFiles(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                    data: null,
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: `Too many files. Maximum allowed: ${MAX_FILES}`,
                    data: null,
                });
            }
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`,
                data: null,
            });
        }
        if (err) {
            // Custom fileFilter errors
            return res.status(400).json({
                success: false,
                message: err.message,
                data: null,
            });
        }
        // Validation: check if total files exceed MAX_FILES
        if (req.files && req.files.length > MAX_FILES) {
            return res.status(400).json({
                success: false,
                message: `Too many files. Maximum allowed: ${MAX_FILES}`,
                data: null,
            });
        }
        next();
    });
};

module.exports = { uploadMessageFiles: uploadMessageFilesWithErrorHandler };

