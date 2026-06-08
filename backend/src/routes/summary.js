import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/summary — Aggregated stats
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(amount), 0) AS "totalAmount",
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
      FROM applications
    `);

    const row = result.rows[0];
    return res.status(200).json({
      total: parseInt(row.total, 10),
      totalAmount: parseFloat(row.totalAmount),
      pending: parseInt(row.pending, 10),
      approved: parseInt(row.approved, 10),
      rejected: parseInt(row.rejected, 10),
    });
  } catch (err) {
    console.error('GET /api/summary error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
