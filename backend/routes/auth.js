const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

// Helper for JWT generation
const generateToken = (doctor) => {
  const secret = process.env.JWT_SECRET || 'ayush_opd_secret_key_2026_secure';
  return jwt.sign(
    { id: doctor.id, name: doctor.name, email: doctor.email, ayush_system: doctor.ayush_system },
    secret,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, ayush_system } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const validSystems = ['Ayurveda', 'Yoga & Naturopathy', 'Unani', 'Siddha', 'Homeopathy'];
    const chosenSystem = validSystems.includes(ayush_system) ? ayush_system : 'Ayurveda';

    // Check existing email
    const existingDoctor = await Doctor.findByEmail(email);
    if (existingDoctor) {
      return res.status(400).json({ error: 'A doctor account with this email already exists.' });
    }

    const doctor = await Doctor.create({
      name,
      email,
      password,
      ayush_system: chosenSystem
    });

    const token = generateToken(doctor);

    return res.status(201).json({
      message: 'Doctor account created successfully',
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        ayush_system: doctor.ayush_system
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create doctor account: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const doctor = await Doctor.findByEmail(email);
    if (!doctor) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await Doctor.verifyPassword(password, doctor.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(doctor);

    return res.status(200).json({
      message: 'Login successful',
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        ayush_system: doctor.ayush_system
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server authentication failed: ' + err.message });
  }
});

module.exports = router;
