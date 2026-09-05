const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDb } = require('./config/database');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const caseRoutes = require('./routes/cases');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets for unified local setup
const frontendPublicPath = path.join(__dirname, '../frontend/public');
const frontendCssPath = path.join(__dirname, '../frontend/css');
const frontendJsPath = path.join(__dirname, '../frontend/js');

app.use(express.static(frontendPublicPath));
app.use('/css', express.static(frontendCssPath));
app.use('/js', express.static(frontendJsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'AYUSH OPD CMS API', timestamp: new Date() });
});

// Single Page Application Fallback for static frontend
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendPublicPath, 'index.html'));
});

// Start Server after initializing Database
if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 AYUSH OPD CMS Backend running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to initialize database connection:', err);
    app.listen(PORT, () => {
      console.log(`🚀 AYUSH OPD CMS Backend running on http://localhost:${PORT} (Database degraded)`);
    });
  });
}

module.exports = app;
