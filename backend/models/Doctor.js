const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Doctor {
  static async create({ name, email, password, ayush_system = 'Ayurveda' }) {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const text = `
      INSERT INTO doctors (name, email, password_hash, ayush_system)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, ayush_system, created_at
    `;
    const params = [name, email.toLowerCase(), password_hash, ayush_system];
    
    const result = await db.query(text, params);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const text = `SELECT * FROM doctors WHERE LOWER(email) = LOWER($1)`;
    const result = await db.query(text, [email]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const text = `SELECT id, name, email, ayush_system, created_at FROM doctors WHERE id = $1`;
    const result = await db.query(text, [id]);
    return result.rows[0] || null;
  }

  static async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  }
}

module.exports = Doctor;
