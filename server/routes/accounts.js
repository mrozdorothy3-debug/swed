const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Simple accounts API for the client demo
// Returns a minimal list of accounts based on ?user= query (username or email).
router.get('/', async (req, res) => {
  try {
    const raw = (req.query.user || '').toString().trim();
    let doc = null;

    if (raw) {
      if (raw.includes('@')) {
        // treat as email
        doc = await User.findOne({ email: raw.toLowerCase() }).lean();
      } else {
        // treat as "First Last" username (case-insensitive)
        const parts = raw.split(/\s+/);
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ') || '';
        doc = await User.findOne({
          firstName: new RegExp(`^${first}$`, 'i'),
          lastName: new RegExp(`^${last}$`, 'i'),
        }).lean();
      }
    }

    // Fallback to Neil if not found
    if (!doc) {
      doc = await User.findOne({ email: 'neil.harryman@example.com' }).lean();
    }

    const balance = doc?.account?.balance ?? 0;
    const transferFee = doc?.account?.transferFee ?? 3000;

    const accounts = [
      { id: 'primary', type: 'checking', balance, transferFee },
    ];

    res.json(accounts);
  } catch (err) {
    console.error('GET /accounts failed:', err.message);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
});

module.exports = router;

