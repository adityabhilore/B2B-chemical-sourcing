// src/lib/multer.js
// ─────────────────────────────────────────────────────────────────────────────
// Multer configuration — memory storage (buffers sent directly to Cloudinary).
// Two pre-configured instances:
//   imageUpload   — accepts images only, max 10 MB
//   documentUpload — accepts PDF/Office docs, max 25 MB
// ─────────────────────────────────────────────────────────────────────────────

import multer from "multer";

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_DOC_MIMES = new Set([
  "application/pdf",
]);

function imageFilter(_req, file, cb) {
  if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error("Only JPEG, PNG, and WebP images are allowed"), {
        status: 400,
      })
    );
  }
}

function documentFilter(_req, file, cb) {
  if (ALLOWED_DOC_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error("Only PDF documents are allowed"), {
        status: 400,
      })
    );
  }
}

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: imageFilter,
});

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: documentFilter,
});
