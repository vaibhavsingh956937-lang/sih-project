const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Patient = require('../models/Patient');
const CaseSheet = require('../models/CaseSheet');

const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

// GET /api/patients/export/csv (export directory to CSV, protected)
router.get('/export/csv', requireAuth, async (req, res) => {
  try {
    const patients = await Patient.search('');
    
    let csv = 'Aadhar Number,Full Name,Age,Gender,Phone,Village,District,State,OPD Token,Registered Date\n';
    patients.forEach(p => {
      const age = calculateAge(p.date_of_birth) || '';
      const regDate = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '';
      csv += `"${p.aadhar_number}","${p.full_name}","${age}","${p.gender || ''}","${p.phone || ''}","${p.village || ''}","${p.district || ''}","${p.state || ''}","${p.opd_token || ''}","${regDate}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="AYUSH_OPD_Patients_Directory.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to export CSV: ' + err.message });
  }
});

// GET /api/patients/schedule/followups (get follow-up schedule calendar, protected)
router.get('/schedule/followups', requireAuth, async (req, res) => {
  try {
    const schedule = await CaseSheet.getFollowUpSchedule();
    return res.status(200).json(schedule);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch follow-up schedule: ' + err.message });
  }
});

// GET /api/patients?search=value (protected)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const patients = await Patient.search(search);

    const formatted = patients.map(p => ({
      id: p.id,
      aadhar_number: p.aadhar_number,
      full_name: p.full_name,
      date_of_birth: p.date_of_birth,
      age: calculateAge(p.date_of_birth),
      gender: p.gender,
      phone: p.phone,
      address: p.address,
      village: p.village,
      district: p.district,
      state: p.state,
      opd_token: p.opd_token,
      created_at: p.created_at,
      last_visit: p.last_visit || null
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('Fetch patients error:', err);
    return res.status(500).json({ error: 'Failed to search patients: ' + err.message });
  }
});

// POST /api/patients (create new patient, protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      aadhar_number,
      full_name,
      date_of_birth,
      gender,
      phone,
      address,
      village,
      district,
      state
    } = req.body;

    if (!aadhar_number || !full_name) {
      return res.status(400).json({ error: 'Aadhar Number and Full Name are mandatory.' });
    }

    const cleanAadhar = String(aadhar_number).trim();
    if (!/^\d{12}$/.test(cleanAadhar)) {
      return res.status(400).json({ error: 'Aadhar Number must be exactly 12 numeric digits.' });
    }

    if (phone) {
      const cleanPhone = String(phone).trim();
      if (!/^\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
      }
    }

    const existing = await Patient.findByAadhar(cleanAadhar);
    if (existing) {
      return res.status(400).json({ error: `Patient with Aadhar ${cleanAadhar} is already registered.` });
    }

    const patient = await Patient.create({
      aadhar_number: cleanAadhar,
      full_name: full_name.trim(),
      date_of_birth: date_of_birth || null,
      gender: gender || 'Other',
      phone: phone ? String(phone).trim() : null,
      address: address ? address.trim() : null,
      village: village ? village.trim() : null,
      district: district ? district.trim() : null,
      state: state ? state.trim() : null,
      created_by: req.doctor.id
    });

    return res.status(201).json({
      message: 'Patient registered successfully',
      patient: {
        ...patient,
        age: calculateAge(patient.date_of_birth)
      }
    });
  } catch (err) {
    console.error('Register patient error:', err);
    return res.status(500).json({ error: 'Failed to register patient: ' + err.message });
  }
});

// GET /api/patients/:aadhar/cases (get patient's case history timeline, protected)
router.get('/:aadhar/cases', requireAuth, async (req, res) => {
  try {
    const { aadhar } = req.params;
    const limit = parseInt(req.query.limit || 50, 10);
    const cases = await CaseSheet.findByPatientAadhar(aadhar, limit);
    return res.status(200).json(cases);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch case sheets: ' + err.message });
  }
});

// GET /api/patients/:aadhar (get patient details + full case history, protected)
router.get('/:aadhar', requireAuth, async (req, res) => {
  try {
    const { aadhar } = req.params;
    const cleanAadhar = String(aadhar).trim();
    const patient = await Patient.findByAadhar(cleanAadhar);

    if (!patient) {
      return res.status(404).json({ error: `No patient found with Aadhar number ${cleanAadhar}.` });
    }

    const cases = await CaseSheet.findByPatientAadhar(cleanAadhar, 100);

    return res.status(200).json({
      patient: {
        ...patient,
        age: calculateAge(patient.date_of_birth)
      },
      cases
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch patient records: ' + err.message });
  }
});

module.exports = router;
