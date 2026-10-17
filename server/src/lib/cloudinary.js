// src/lib/cloudinary.js
// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary SDK singleton — configured once at startup.
// ─────────────────────────────────────────────────────────────────────────────

import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";
import { reportOperationalFailure } from "../utils/observability.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export { cloudinary };

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {object} opts  — folder, resource_type, public_id_prefix, etc.
 * @returns {Promise<{publicId: string, url: string, bytes: number}>}
 */
export async function uploadBuffer(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", ...opts },
      (err, result) => {
        if (err) { reportOperationalFailure('upload', err); return reject(err); }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete a resource from Cloudinary by its public_id.
 * Silently succeeds if resource doesn't exist (already deleted).
 */
export async function deleteResource(publicId, resourceType = "image") {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // Non-fatal — resource may have been deleted externally
  }
}
