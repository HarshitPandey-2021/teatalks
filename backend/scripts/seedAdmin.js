const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/user');

dotenv.config();

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const campusName = process.env.ADMIN_CAMPUS_NAME || 'TeaTalks Admin';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  const existingAdmin = await User.findOne({ role: 'admin' }).select('_id email');
  if (existingAdmin) {
    console.log(`Admin already exists (${existingAdmin.email}). Creation is locked.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    campusName,
    email,
    password: hashedPassword,
    anonymousName: 'Campus Admin',
    emoji: '🛡️',
    role: 'admin',
  });

  console.log(`Admin user created for ${email}`);
}

async function run() {
  try {
    await connectDB();
    await seedAdmin();
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

run();
