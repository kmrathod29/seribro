// middleware/uploadMiddleware.js (Hinglish: File upload ke liye Multer middleware)

const multer = require('multer');
const path = require('path');

// Storage configuration (Hinglish: File kahan aur kis naam se save hogi)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Hinglish: Files 'uploads' folder mein save hongi
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Hinglish: File ka unique naam banana: fieldname-timestamp-originalextension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter to allow only images and PDFs (Hinglish: Sirf images aur PDF allow karna)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true); // Hinglish: File accept karo
  } else {
    // Hinglish: Error message agar file type galat ho
    cb(new Error('Only .png, .jpg, .jpeg and .pdf format allowed!'), false);
  }
};

// Multer upload instance (Hinglish: Multer ka instance)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Hinglish: File size limit 5MB
  fileFilter: fileFilter,
});

module.exports = upload;