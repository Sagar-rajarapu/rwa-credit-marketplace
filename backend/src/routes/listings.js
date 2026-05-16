const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');

// GET /listings?status=open&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status || 'open';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      'SELECT * FROM listings WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [status, limit, offset]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /listings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM listings WHERE listing_id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /listings
router.post(
  '/',
  [
    body('listing_id').isInt(),
    body('borrower_address').isLength({ min: 56, max: 56 }),
    body('title').notEmpty(),
    body('target_amount').isInt({ min: 1 }),
    body('interest_bps').isInt({ min: 1 }),
    body('duration_days').isInt({ min: 1 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { listing_id, borrower_address, title, description, asset_type,
              target_amount, interest_bps, duration_days, loan_pool_contract, loan_id } = req.body;
      const { rows } = await db.query(
        `INSERT INTO listings (listing_id, borrower_address, title, description, asset_type,
          target_amount, interest_bps, duration_days, loan_pool_contract, loan_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [listing_id, borrower_address, title, description, asset_type,
         target_amount, interest_bps, duration_days, loan_pool_contract, loan_id]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// PATCH /listings/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['open', 'funded', 'cancelled'].includes(status))
      return res.status(400).json({ error: 'invalid status' });
    const { rows } = await db.query(
      'UPDATE listings SET status=$1 WHERE listing_id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
