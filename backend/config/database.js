const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

let pool;
let isPgConnected = false;

// In-memory database store for fallback mode when PostgreSQL connection is unavailable locally
const inMemoryDb = {
  doctors: [],
  patients: [],
  case_sheets: [],
  doctor_id_seq: 1,
  patient_id_seq: 1,
  case_id_seq: 1
};

const createTablesSql = `
  CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ayush_system VARCHAR(50) DEFAULT 'Ayurveda',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    aadhar_number VARCHAR(12) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    phone VARCHAR(10),
    address TEXT,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(50),
    created_by INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_patients_aadhar ON patients(aadhar_number);
  CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
  CREATE INDEX IF NOT EXISTS idx_patients_name_lower ON patients(LOWER(full_name));

  CREATE TABLE IF NOT EXISTS case_sheets (
    id SERIAL PRIMARY KEY,
    patient_aadhar VARCHAR(12) NOT NULL REFERENCES patients(aadhar_number) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    ayush_system VARCHAR(50),
    visit_date TIMESTAMP DEFAULT NOW(),
    chief_complaint VARCHAR(500) NOT NULL,
    symptoms TEXT,
    examination_findings TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    medicines_prescribed TEXT,
    dosage_instructions TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_cases_aadhar ON case_sheets(patient_aadhar);
  CREATE INDEX IF NOT EXISTS idx_cases_visit_date ON case_sheets(visit_date DESC);
`;

const initDb = async () => {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      const isProduction = process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech');
      pool = new Pool({
        connectionString,
        ssl: isProduction ? { rejectUnauthorized: false } : false
      });

      // Test connection
      const client = await pool.connect();
      await client.query(createTablesSql);
      client.release();
      isPgConnected = true;
      console.log('✅ Connected to PostgreSQL database and verified tables.');
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to PostgreSQL DB. Switching to local high-speed in-memory DB fallback:', err.message);
    }
  } else {
    console.log('ℹ️ No DATABASE_URL set. Operating in high-speed in-memory mode.');
  }

  isPgConnected = false;
};

// Unified Query interface compatible with pg
const query = async (text, params = []) => {
  if (isPgConnected && pool) {
    return await pool.query(text, params);
  }

  // Fallback memory DB executor matching Postgres SQL patterns used in the models
  const sql = text.trim();

  // --- DOCTORS HANDLERS ---
  if (sql.startsWith('INSERT INTO doctors')) {
    const [name, email, password_hash, ayush_system] = params;
    const existing = inMemoryDb.doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const error = new Error('duplicate key value violates unique constraint "doctors_email_key"');
      error.code = '23505';
      throw error;
    }
    const newDoc = {
      id: inMemoryDb.doctor_id_seq++,
      name,
      email,
      password_hash,
      ayush_system: ayush_system || 'Ayurveda',
      created_at: new Date()
    };
    inMemoryDb.doctors.push(newDoc);
    return { rows: [newDoc], rowCount: 1 };
  }

  if (sql.includes('FROM doctors WHERE email')) {
    const email = params[0];
    const doc = inMemoryDb.doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
    return { rows: doc ? [{ ...doc }] : [], rowCount: doc ? 1 : 0 };
  }

  if (sql.includes('FROM doctors WHERE id')) {
    const id = parseInt(params[0], 10);
    const doc = inMemoryDb.doctors.find(d => d.id === id);
    return { rows: doc ? [{ ...doc }] : [], rowCount: doc ? 1 : 0 };
  }

  // --- PATIENTS HANDLERS ---
  if (sql.startsWith('INSERT INTO patients')) {
    const [aadhar_number, full_name, date_of_birth, gender, phone, address, village, district, state, created_by] = params;
    const existing = inMemoryDb.patients.find(p => p.aadhar_number === aadhar_number);
    if (existing) {
      const error = new Error('duplicate key value violates unique constraint "patients_aadhar_number_key"');
      error.code = '23505';
      throw error;
    }
    const newPatient = {
      id: inMemoryDb.patient_id_seq++,
      aadhar_number,
      full_name,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      phone: phone || null,
      address: address || null,
      village: village || null,
      district: district || null,
      state: state || null,
      created_by: created_by || null,
      created_at: new Date()
    };
    inMemoryDb.patients.push(newPatient);
    return { rows: [newPatient], rowCount: 1 };
  }

  if (sql.includes('FROM patients') && sql.includes('WHERE aadhar_number =')) {
    const aadhar = params[0];
    const patient = inMemoryDb.patients.find(p => p.aadhar_number === aadhar);
    return { rows: patient ? [{ ...patient }] : [], rowCount: patient ? 1 : 0 };
  }

  if (sql.includes('FROM patients') && (sql.includes('ILIKE') || sql.includes('LIKE') || sql.includes('LOWER('))) {
    const searchVal = (params[0] || '').replace(/%/g, '').toLowerCase();
    const matches = inMemoryDb.patients.filter(p => 
      p.aadhar_number.includes(searchVal) ||
      p.full_name.toLowerCase().includes(searchVal) ||
      (p.phone && p.phone.includes(searchVal))
    );
    // Join last visit date for each match
    const result = matches.map(p => {
      const patientCases = inMemoryDb.case_sheets
        .filter(c => c.patient_aadhar === p.aadhar_number)
        .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
      return {
        ...p,
        last_visit: patientCases.length > 0 ? patientCases[0].visit_date : null
      };
    });
    return { rows: result, rowCount: result.length };
  }

  // --- CASE SHEETS HANDLERS ---
  if (sql.startsWith('INSERT INTO case_sheets')) {
    const [patient_aadhar, doctor_id, ayush_system, chief_complaint, symptoms, examination_findings, diagnosis, treatment_plan, medicines_prescribed, dosage_instructions, follow_up_date, notes] = params;
    const newCase = {
      id: inMemoryDb.case_id_seq++,
      patient_aadhar,
      doctor_id,
      ayush_system,
      visit_date: new Date(),
      chief_complaint,
      symptoms: symptoms || '',
      examination_findings: examination_findings || '',
      diagnosis: diagnosis || '',
      treatment_plan: treatment_plan || '',
      medicines_prescribed: medicines_prescribed || '',
      dosage_instructions: dosage_instructions || '',
      follow_up_date: follow_up_date || null,
      notes: notes || '',
      created_at: new Date()
    };
    inMemoryDb.case_sheets.push(newCase);
    return { rows: [newCase], rowCount: 1 };
  }

  if (sql.includes('FROM case_sheets') && sql.includes('WHERE id =')) {
    const id = parseInt(params[0], 10);
    const cs = inMemoryDb.case_sheets.find(c => c.id === id);
    if (cs) {
      const doc = inMemoryDb.doctors.find(d => d.id === cs.doctor_id);
      const patient = inMemoryDb.patients.find(p => p.aadhar_number === cs.patient_aadhar);
      return { rows: [{ ...cs, doctor_name: doc ? doc.name : 'Unknown Doctor', patient_name: patient ? patient.full_name : 'Unknown Patient' }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (sql.includes('FROM case_sheets') && sql.includes('WHERE patient_aadhar =')) {
    const aadhar = params[0];
    const cases = inMemoryDb.case_sheets
      .filter(c => c.patient_aadhar === aadhar)
      .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
      .map(c => {
        const doc = inMemoryDb.doctors.find(d => d.id === c.doctor_id);
        return { ...c, doctor_name: doc ? doc.name : 'Dr. AYUSH' };
      });
    return { rows: cases, rowCount: cases.length };
  }

  // --- ANALYTICS HANDLERS ---
  if (sql.includes('COUNT(DISTINCT') || sql.includes('COUNT(*)')) {
    const total_patients = inMemoryDb.patients.length;
    const total_cases = inMemoryDb.case_sheets.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const cases_today = inMemoryDb.case_sheets.filter(c => {
      const vDate = new Date(c.visit_date).toISOString().split('T')[0];
      return vDate === todayStr;
    }).length;

    const system_wise_count = {
      'Ayurveda': 0,
      'Yoga & Naturopathy': 0,
      'Unani': 0,
      'Siddha': 0,
      'Homeopathy': 0
    };

    inMemoryDb.case_sheets.forEach(c => {
      if (c.ayush_system && system_wise_count[c.ayush_system] !== undefined) {
        system_wise_count[c.ayush_system]++;
      } else if (c.ayush_system) {
        system_wise_count[c.ayush_system] = 1;
      }
    });

    return {
      rows: [{
        total_patients,
        total_cases,
        cases_today,
        system_wise_count
      }],
      rowCount: 1
    };
  }

  return { rows: [], rowCount: 0 };
};

module.exports = {
  initDb,
  query,
  isPgConnected: () => isPgConnected,
  getInMemoryDb: () => inMemoryDb
};
