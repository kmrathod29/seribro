// backend/middleware/workSubmissionUploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_FILES = Number(process.env.WORK_MAX_FILES || 10);
const MAX_FILE_SIZE_MB = Number(process.env.WORK_MAX_FILE_SIZE_MB || 100);
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const uploadDir = path.join(__dirname, '..', 'uploads', 'work-submissions');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Allowed extensions and mime types for work submissions
const allowedExt = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z', '.tar', '.gz', '.txt', '.md', '.html', '.css', '.js', '.ts', '.py', '.java', '.psd', '.fig', '.sketch', '.ai'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) return cb(null, true);
  // allow by MIME as fallback for certain types
  const allowMimes = /image\/|pdf|text\/|application\//;
  if (allowMimes.test(file.mimetype)) return cb(null, true);
  cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type'));
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter,
});

// Export middleware for field 'workFiles' - array up to MAX_FILES
const uploadWorkFiles = upload.array('workFiles', MAX_FILES);

module.exports = { uploadWorkFiles };
