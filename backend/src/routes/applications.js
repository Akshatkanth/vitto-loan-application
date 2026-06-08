import express from 'express';
import pool from '../db.js';

const router = express.Router();

const VALID_LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English'];
const VALID_STATUSES = ['pending', 'approved', 'rejected'];

// POST /api/applications — Submit a new loan application
router.post('/', async (req, res) => {
  try {
    const { name, mobile, amount, purpose, language } = req.body;

    if (!name || !mobile || !amount || !purpose || !language) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!/^\d{10}$/.test(String(mobile))) {
      return res.status(400).json({ error: 'Mobile number must be exactly 10 digits.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Loan amount must be a positive number.' });
    }

    if (!VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: `Language must be one of: ${VALID_LANGUAGES.join(', ')}.`,
      });
    }

    const result = await pool.query(
      `INSERT INTO applications (name, mobile, amount, purpose, language)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), String(mobile).trim(), parsedAmount, purpose.trim(), language]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/applications error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/applications — Fetch all applications, optional ?status= filter
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}.` });
    }

    let query = 'SELECT * FROM applications';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /api/applications error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/applications/:id/status — Update application status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}.` });
    }

    const result = await pool.query(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /api/applications/:id/status error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
