const multer = require('multer');
const path = require('path');

// Store files in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

// File filter - images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

module.exports = upload;
// Error handler for multer
upload.errorHandler = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};