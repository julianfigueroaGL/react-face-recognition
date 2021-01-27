const express = require('express');
const router = express.Router();
const client = require('../config/db');

// @route GET profile by ID
// @desc Auth user and get token
// @access Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const sqlSentence = `SELECT * FROM users WHERE id IN ('${id}')`;
  const { rows: users } = await client.query(sqlSentence);
  const user = users[0];

  if (users.length === 0) {
    return res.status(400).json({
      user: {},
    });
  }

  res.json({ user });
});

module.exports = router;
