const { v2: cloudinary } = require('cloudinary');

const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

function assertCloudinaryEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  return missing;
}

function initCloudinary() {
  const missing = assertCloudinaryEnv();
  if (missing.length > 0) {
    console.warn(`Cloudinary disabled. Missing env vars: ${missing.join(', ')}`);
    return false;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return true;
}

module.exports = {
  cloudinary,
  initCloudinary,
};
