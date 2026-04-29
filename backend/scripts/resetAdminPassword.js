const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/user');

dotenv.config();

async function resetAdminPassword() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    throw new Error('No admin account found. Run seed script first.');
  }

  if (admin.email !== email) {
    throw new Error(`Configured ADMIN_EMAIL (${email}) does not match existing admin (${admin.email})`);
  }

  admin.password = await bcrypt.hash(password, 10);
  await admin.save();
  console.log(`Admin password updated for ${email}`);
}

async function run() {
  try {
    await connectDB();
    await resetAdminPassword();
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

run();
