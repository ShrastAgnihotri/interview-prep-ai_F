/**
 * @module middleware/upload
 * @description Multer middleware for PDF file uploads.
 * Uses memory storage with 3MB limit and PDF-only MIME type validation.
 */

const multer = require('multer');
const ApiError = require('../utils/ApiError');

/** Multer memory storage — files kept in buffer (no disk writes) */
const storage = multer.memoryStorage();

/**
 * File filter — accept only application/pdf MIME type.
 * @param {import('express').Request} _req
 * @param {Express.Multer.File} file
 * @param {multer.FileFilterCallback} cb
 */
const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF files are allowed. Please upload a .pdf file.'), false);
  }
};

/** Configured multer instance */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
  },
});

/**
 * Express middleware for single PDF upload on field 'resume'.
 * Wraps multer to provide friendly error messages for common failures.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const uploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single('resume');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'File too large. Maximum allowed size is 3 MB.'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new ApiError(400, 'Unexpected field name. Use "resume" as the form field name.'));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    }

    if (err) {
      return next(err);
    }

    next();
  });
};

module.exports = uploadMiddleware;
