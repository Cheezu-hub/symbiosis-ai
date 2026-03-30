const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'SymbioTech API', db: 'PostgreSQL' });
});

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/industries', require('./routes/industries'));
app.use('/api/waste',      require('./routes/waste'));
app.use('/api/resources',  require('./routes/resource'));
app.use('/api/matches',    require('./routes/matches'));
app.use('/api/impact',     require('./routes/impact'));

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   🚀  SymbioTech API (PostgreSQL) Started    ║
║   Port : ${PORT}                               ║
║   URL  : http://localhost:${PORT}/api/health   ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
