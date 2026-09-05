const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const CaseSheet = require('../models/CaseSheet');
const Patient = require('../models/Patient');

// POST /api/cases (create new case sheet, protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      patient_aadhar,
      ayush_system,
      chief_complaint,
      symptoms,
      examination_findings,
      diagnosis,
      treatment_plan,
      medicines_prescribed,
      dosage_instructions,
      follow_up_date,
      notes
    } = req.body;

    if (!patient_aadhar || !chief_complaint) {
      return res.status(400).json({ error: 'Patient Aadhar number and Chief Complaint are mandatory fields.' });
    }

    if (!diagnosis && !treatment_plan) {
      return res.status(400).json({ error: 'At least Diagnosis or Treatment Plan must be provided for the case sheet.' });
    }

    // Verify patient exists
    const patient = await Patient.findByAadhar(patient_aadhar);
    if (!patient) {
      return res.status(404).json({ error: `Cannot save case sheet: Patient with Aadhar ${patient_aadhar} is not registered.` });
    }

    const selectedSystem = ayush_system || req.doctor.ayush_system || 'Ayurveda';

    const newCase = await CaseSheet.create({
      patient_aadhar,
      doctor_id: req.doctor.id,
      ayush_system: selectedSystem,
      chief_complaint,
      symptoms,
      examination_findings,
      diagnosis,
      treatment_plan,
      medicines_prescribed,
      dosage_instructions,
      follow_up_date: follow_up_date || null,
      notes
    });

    return res.status(201).json({
      message: 'Case sheet saved successfully',
      case: newCase
    });
  } catch (err) {
    console.error('Create case sheet error:', err);
    return res.status(500).json({ error: 'Failed to create case sheet: ' + err.message });
  }
});

// GET /api/cases/:caseId (get specific case sheet, protected)
router.get('/:caseId', requireAuth, async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseSheet = await CaseSheet.findById(caseId);

    if (!caseSheet) {
      return res.status(404).json({ error: 'Case sheet not found.' });
    }

    return res.status(200).json({ case: caseSheet });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch case sheet: ' + err.message });
  }
});

module.exports = router;
