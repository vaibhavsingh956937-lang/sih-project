const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const CaseSheet = require('../models/CaseSheet');

// GET /api/analytics/dashboard (protected)
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const data = await CaseSheet.getDashboardAnalytics();
    return res.status(200).json({
      total_patients: parseInt(data.total_patients || 0, 10),
      total_cases: parseInt(data.total_cases || 0, 10),
      cases_today: parseInt(data.cases_today || 0, 10),
      system_wise_count: data.system_wise_count || {
        'Ayurveda': 0,
        'Yoga & Naturopathy': 0,
        'Unani': 0,
        'Siddha': 0,
        'Homeopathy': 0
      }
    });
  } catch (err) {
    console.error('Analytics dashboard error:', err);
    return res.status(500).json({ error: 'Failed to retrieve analytics metrics: ' + err.message });
  }
});

module.exports = router;
