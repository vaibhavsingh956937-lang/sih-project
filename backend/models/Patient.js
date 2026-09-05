const db = require('../config/database');

class Patient {
  static async create({
    aadhar_number,
    full_name,
    date_of_birth,
    gender,
    phone,
    address,
    village,
    district,
    state,
    created_by
  }) {
    const text = `
      INSERT INTO patients (
        aadhar_number, full_name, date_of_birth, gender, phone,
        address, village, district, state, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      aadhar_number,
      full_name,
      date_of_birth || null,
      gender || null,
      phone || null,
      address || null,
      village || null,
      district || null,
      state || null,
      created_by || null
    ];

    const result = await db.query(text, params);
    return result.rows[0];
  }

  static async findByAadhar(aadhar_number) {
    const text = `
      SELECT p.*, d.name AS creator_doctor_name 
      FROM patients p
      LEFT JOIN doctors d ON p.created_by = d.id
      WHERE p.aadhar_number = $1
    `;
    const result = await db.query(text, [aadhar_number]);
    return result.rows[0] || null;
  }

  static async search(queryStr = '') {
    const trimmed = queryStr.trim();
    let text;
    let params;

    if (!trimmed) {
      text = `
        SELECT p.*, MAX(c.visit_date) AS last_visit, COUNT(c.id) AS total_visits
        FROM patients p
        LEFT JOIN case_sheets c ON p.aadhar_number = c.patient_aadhar
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 50
      `;
      params = [];
    } else {
      text = `
        SELECT p.*, MAX(c.visit_date) AS last_visit, COUNT(c.id) AS total_visits
        FROM patients p
        LEFT JOIN case_sheets c ON p.aadhar_number = c.patient_aadhar
        WHERE p.aadhar_number = $1
           OR p.phone LIKE $2
           OR LOWER(p.full_name) LIKE LOWER($2)
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 50
      `;
      params = [trimmed, `%${trimmed}%`];
    }

    const result = await db.query(text, params);
    return result.rows;
  }
}

module.exports = Patient;
