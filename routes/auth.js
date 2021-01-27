const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const client = require('../config/db');

// @route POST signin
// @desc Auth user and get token
// @access Public
router.post(
  '/signin',
  [check('email', 'Please enter a valid email').isEmail(), check('password', 'Please enter a password').exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      let sqlSentence = `SELECT * FROM login WHERE email IN ('${email}')`;
      let { rows } = await client.query(sqlSentence);

      if (rows.length === 0) {
        return res.status(400).json({
          user: {},
        });
      }

      const { hash } = rows[0];
      const isMatch = bcrypt.compareSync(password, hash);

      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid Credentials',
        });
      }

      // Get user
      sqlSentence = `SELECT * FROM users WHERE email IN ('${email}')`;
      const getSignInUser = await client.query(sqlSentence);

      if (getSignInUser.rows.length === 0) {
        return res.status(400).json({
          user: {},
        });
      }

      const user = getSignInUser.rows[0];
      res.json({ user });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        message: 'Server Error',
      });
    }
    // res.json({ email, password });
  }
);

// @route POST register
// @desc Auth user and get token
// @access Public
router.post(
  '/register',
  [
    check('name', 'Please enter a Name, is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, name, password } = req.body;

    try {
      const sqlSentence = `SELECT * FROM users WHERE email IN ('${email}')`;
      let { rows } = await client.query(sqlSentence);

      if (rows.length > 0) {
        return res.status(400).json({
          user: {},
        });
      }

      // Generating the hash
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Inserting into login table
      let text = 'INSERT INTO login(hash, email) VALUES($1, $2) RETURNING email';
      let values = [hash, email];
      const insertLoginTable = await client.query(text, values);

      if (insertLoginTable.rows.length === 0) {
        return res.status(400).json({
          user: {},
        });
      }

      // Inserting into users table
      text = 'INSERT INTO users(name, email, joined) VALUES($1, $2, $3) RETURNING *';
      values = [name, email, new Date()];
      const insertUserTable = await client.query(text, values);

      if (insertUserTable.rows.length === 0) {
        return res.status(400).json({
          user: {},
        });
      }

      const user = insertUserTable.rows[0];
      res.json({ user });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        message: 'Server Error',
      });
    }
    // res.json({ email, name, password });
  }
);

module.exports = router;
