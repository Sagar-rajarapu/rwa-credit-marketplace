const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');

// GET /investments?investor=<address>
router.get('/', async (req, res, next) => {
  try {
    const { investor } = req.query;
    if (!investor) return res.status(400).json({ error: 'investor address required' });
    const { rows } = await db.query(
      `SELECT i.*, l.title, l.interest_bps, l.duration_days
       FROM investments i
       JOIN listings l ON i.listing_id = l.listing_id
       WHERE i.investor_address = $1
       ORDER BY i.created_at DESC`,
      [investor]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /investments - record after on-chain fund tx
router.post(
  '/',
  [
    body('listing_id').isInt(),
    body('investor_address').isLength({ min: 56, max: 56 }),
    body('amount').isInt({ min: 1 }),
    // Stellar tx hashes are 64 hex characters
    body('tx_hash').matches(/^[0-9a-fA-F]{64}$/),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { listing_id, investor_address, amount, tx_hash } = req.body;
      const { rows } = await db.query(
        'INSERT INTO investments (listing_id, investor_address, amount, tx_hash) VALUES ($1,$2,$3,$4) RETURNING *',
        [listing_id, investor_address, amount, tx_hash]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

module.exports = router;
