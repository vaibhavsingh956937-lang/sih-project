const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Doctor = require('../models/Doctor');

// GET /api/doctors/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }

    return res.status(200).json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        ayush_system: doctor.ayush_system,
        created_at: doctor.created_at
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch doctor profile: ' + err.message });
  }
});

module.exports = router;
