const express = require('express');
const router = express.Router();
const Clarifai = require('clarifai');
const client = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const app = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY,
});

// @route POST url to Clarifai
// @desc Auth user and get token
// @access Public
router.post('/', async (req, res) => {
  const { input } = req.body;

  try {
    const response = await app.models.predict(Clarifai.FACE_DETECT_MODEL, input);

    if (response.length === 0) {
      return res.status(400).json({
        image: {},
      });
    }

    res.json({ data: response });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

// @route PUT Image
// @desc Auth user and get token
// @access Public
router.put('/', async (req, res) => {
  const { id } = req.body;

  try {
    let sqlSentence = `SELECT * FROM users WHERE id IN ('${id}')`;
    const { rows: users } = await client.query(sqlSentence);
    const user = users[0];
    user.entries = Number(user.entries) + 1;

    if (users.length === 0) {
      return res.status(400).json({
        user: {},
      });
    }

    await client.query('UPDATE users SET entries = $1 WHERE id = $2;', [JSON.stringify(user.entries), id]);

    res.json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

module.exports = router;
