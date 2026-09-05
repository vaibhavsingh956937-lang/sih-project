const db = require('../config/database');

class CaseSheet {
  static async create({
    patient_aadhar,
    doctor_id,
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
  }) {
    const text = `
      INSERT INTO case_sheets (
        patient_aadhar, doctor_id, ayush_system, chief_complaint,
        symptoms, examination_findings, diagnosis, treatment_plan,
        medicines_prescribed, dosage_instructions, follow_up_date, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const params = [
      patient_aadhar,
      doctor_id,
      ayush_system || 'Ayurveda',
      chief_complaint,
      symptoms || null,
      examination_findings || null,
      diagnosis || null,
      treatment_plan || null,
      medicines_prescribed || null,
      dosage_instructions || null,
      follow_up_date || null,
      notes || null
    ];

    const result = await db.query(text, params);
    return result.rows[0];
  }

  static async findById(id) {
    const text = `
      SELECT c.*, d.name AS doctor_name, d.email AS doctor_email, p.full_name AS patient_name
      FROM case_sheets c
      JOIN doctors d ON c.doctor_id = d.id
      JOIN patients p ON c.patient_aadhar = p.aadhar_number
      WHERE c.id = $1
    `;
    const result = await db.query(text, [id]);
    return result.rows[0] || null;
  }

  static async findByPatientAadhar(patient_aadhar, limit = 50) {
    const text = `
      SELECT c.*, d.name AS doctor_name, d.ayush_system AS doctor_system
      FROM case_sheets c
      JOIN doctors d ON c.doctor_id = d.id
      WHERE c.patient_aadhar = $1
      ORDER BY c.visit_date DESC
      LIMIT $2
    `;
    const result = await db.query(text, [patient_aadhar, limit]);
    return result.rows;
  }

  static async getDashboardAnalytics() {
    const text = `
      SELECT 
        (SELECT COUNT(*) FROM patients) AS total_patients,
        (SELECT COUNT(*) FROM case_sheets) AS total_cases,
        (SELECT COUNT(*) FROM case_sheets WHERE DATE(visit_date) = CURRENT_DATE) AS cases_today,
        json_object_agg(COALESCE(ayush_system, 'Other'), system_count) AS system_wise_count
      FROM (
        SELECT ayush_system, COUNT(*) AS system_count 
        FROM case_sheets 
        GROUP BY ayush_system
      ) sub;
    `;
    
    try {
      const result = await db.query(text);
      if (result.rows.length > 0 && result.rows[0].total_patients !== undefined) {
        return result.rows[0];
      }
    } catch (err) {
      // Fallback query formatting for databases without json_object_agg
    }

    // Direct aggregation fallback
    const resPatients = await db.query(`SELECT COUNT(*) AS total FROM patients`);
    const resCases = await db.query(`SELECT COUNT(*) AS total FROM case_sheets`);
    const resToday = await db.query(`SELECT COUNT(*) AS total FROM case_sheets WHERE DATE(visit_date) = CURRENT_DATE`);
    const resSystems = await db.query(`SELECT ayush_system, COUNT(*) AS cnt FROM case_sheets GROUP BY ayush_system`);

    const systemMap = {
      'Ayurveda': 0,
      'Yoga & Naturopathy': 0,
      'Unani': 0,
      'Siddha': 0,
      'Homeopathy': 0
    };

    if (resSystems && resSystems.rows) {
      resSystems.rows.forEach(r => {
        if (r.ayush_system) {
          systemMap[r.ayush_system] = parseInt(r.cnt || r.count || 0, 10);
        }
      });
    }

    return {
      total_patients: parseInt(resPatients.rows[0]?.total || 0, 10),
      total_cases: parseInt(resCases.rows[0]?.total || 0, 10),
      cases_today: parseInt(resToday.rows[0]?.total || 0, 10),
      system_wise_count: systemMap
    };
  }
}

module.exports = CaseSheet;
