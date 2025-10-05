const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const attachUser = require('./middleware/attachUser');
const idempotencyCheck = require('./middleware/idempotency');
require('dotenv').config();

const app = express();

app.use(attachUser);

app.use(idempotencyCheck);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests, please try again after a minute.',
    },
  },
  keyGenerator: (req, res) => {
    return req.user ? req.user.id : ipKeyGenerator(req);
  },
});

app.use('/api', limiter);


app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.get('/api/_meta', (req, res) => {
  res.status(200).json({
    name: 'HelpDesk Mini API',
    version: '1.0.0',
    description: 'A simple help desk ticketing system API for the hackathon.',
  });
});

// Hackathon manifest file
app.get('/.well-known/hackathon.json', (req, res) => {
  res.status(200).json({
    name: 'HelpDesk Mini',
    project_url: 'https://github.com/Raunit2025/helpdesk-mini',
    live_demo_url: 'your-live-demo-url-if-you-deploy-it', // Optional
  });
});


app.use('/api/users', require('./routes/users'));
app.use('/api/tickets', require('./routes/tickets'));


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));