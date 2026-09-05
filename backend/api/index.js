const app = require('../server');
const { initDb } = require('../config/database');

let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    try {
      await initDb();
      initialized = true;
    } catch (e) {
      console.error('Vercel serverless DB init warning:', e.message);
    }
  }
  return app(req, res);
};
