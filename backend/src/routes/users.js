const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');

router.get('/:address', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM users WHERE stellar_address = $1', [req.params.address]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.post(
  '/',
  [
    body('stellar_address').isLength({ min: 56, max: 56 }),
    body('role').isIn(['borrower', 'investor']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { stellar_address, role } = req.body;
    const { rows } = await db.query(
      'INSERT INTO users (stellar_address, role) VALUES ($1,$2) ON CONFLICT (stellar_address) DO UPDATE SET role=$2 RETURNING *',
      [stellar_address, role]
    );
    res.status(201).json(rows[0]);
  }
);

module.exports = router;
