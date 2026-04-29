const crypto = require('crypto');
const { cloudinary } = require('../config/cloudinary');

const getImageSignature = (req, res) => {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({
      message: 'Cloudinary is not configured on the server',
    });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'teatalks/posts';
  const publicId = `post_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

  const paramsToSign = {
    timestamp,
    folder,
    public_id: publicId,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return res.json({
    timestamp,
    signature,
    folder,
    publicId,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
};

module.exports = {
  getImageSignature,
};
