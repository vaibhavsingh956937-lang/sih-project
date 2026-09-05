const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const CaseSheet = require('../models/CaseSheet');
const Patient = require('../models/Patient');

// Helper to convert empty strings to null
const cleanVal = (val) => {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  return str === '' ? null : str;
};

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
      notes,
      bp,
      pulse,
      weight,
      temperature,
      spo2,
      prakriti_vata,
      prakriti_pitta,
      prakriti_kapha,
      attachment_url
    } = req.body;

    const cleanAadhar = cleanVal(patient_aadhar);
    const cleanComplaint = cleanVal(chief_complaint);

    if (!cleanAadhar || !cleanComplaint) {
      return res.status(400).json({ error: 'Patient Aadhar number and Chief Complaint are mandatory fields.' });
    }

    if (!cleanVal(diagnosis) && !cleanVal(treatment_plan)) {
      return res.status(400).json({ error: 'At least Diagnosis or Treatment Plan must be provided for the case sheet.' });
    }

    // Verify patient exists
    const patient = await Patient.findByAadhar(cleanAadhar);
    if (!patient) {
      return res.status(404).json({ error: `Cannot save case sheet: Patient with Aadhar ${cleanAadhar} is not registered.` });
    }

    const selectedSystem = cleanVal(ayush_system) || req.doctor.ayush_system || 'Ayurveda';

    // Normalize follow_up_date
    let validFollowUp = cleanVal(follow_up_date);
    if (validFollowUp && isNaN(new Date(validFollowUp).getTime())) {
      validFollowUp = null;
    }

    const newCase = await CaseSheet.create({
      patient_aadhar: cleanAadhar,
      doctor_id: req.doctor.id,
      ayush_system: selectedSystem,
      chief_complaint: cleanComplaint,
      symptoms: cleanVal(symptoms),
      examination_findings: cleanVal(examination_findings),
      diagnosis: cleanVal(diagnosis),
      treatment_plan: cleanVal(treatment_plan),
      medicines_prescribed: cleanVal(medicines_prescribed),
      dosage_instructions: cleanVal(dosage_instructions),
      follow_up_date: validFollowUp,
      notes: cleanVal(notes),
      bp: cleanVal(bp),
      pulse: cleanVal(pulse),
      weight: cleanVal(weight),
      temperature: cleanVal(temperature),
      spo2: cleanVal(spo2),
      prakriti_vata: parseInt(prakriti_vata || 33, 10),
      prakriti_pitta: parseInt(prakriti_pitta || 33, 10),
      prakriti_kapha: parseInt(prakriti_kapha || 34, 10),
      attachment_url: cleanVal(attachment_url)
    });

    return res.status(201).json({
      message: 'Case sheet saved successfully',
      case: {
        ...newCase,
        doctor_name: req.doctor.name,
        doctor_system: req.doctor.ayush_system
      }
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
