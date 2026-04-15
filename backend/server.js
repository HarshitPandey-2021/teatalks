const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initCloudinary } = require('./config/cloudinary');

dotenv.config();
connectDB();
initCloudinary();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",   // must be explicit, not '*'
  credentials: true                  // allow cookies/authorization headers
}));
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/professors', require('./routes/professorRoutes'));

app.get('/', (req, res) => {
  res.send('API Running...');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));