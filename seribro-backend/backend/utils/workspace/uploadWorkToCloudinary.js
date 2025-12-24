const path = require('path');
const { uploadToCloudinary } = require('../../utils/students/uploadToCloudinary');

/**
 * Uploads work submission files to Cloudinary under folder seribro/work-submissions/{projectId}
 * @param {Array} files - multer files array
 * @param {String} projectId
 * @returns {Promise<Array>} uploaded files metadata
 */
async function uploadWorkFilesToCloudinary(files = [], projectId) {
  if (!Array.isArray(files) || files.length === 0) return [];

  const uploaded = [];
  for (const file of files) {
    // Use projectId to group files
    const folder = `work-submissions/${projectId}`;
    try {
      const result = await uploadToCloudinary(file.path, folder, projectId);
      uploaded.push({
        filename: file.filename,
        originalName: file.originalname,
        fileType: file.mimetype,
        url: result.secure_url,
        public_id: result.public_id,
        size: file.size,
        uploadedAt: new Date(),
      });
    } catch (err) {
      // If any upload fails, throw and let controller handle cleanup/response
      throw new Error(`Upload failed for ${file.originalname}: ${err.message}`);
    }
  }

  return uploaded;
}

module.exports = { uploadWorkFilesToCloudinary };
