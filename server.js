const express = require('express');
const client = require('./config/db');

const app = express();

// Init Middleware
app.use(
  express.json({
    extended: false,
  })
);

app.get('/', async (req, res) => {
  try {
    const sqlSentence = 'SELECT * FROM users';
    const resp = await client.query(sqlSentence);
    res.json({ users: resp.rows });
    await client.end();
  } catch (e) {
    console.error(e.stack);
    await client.end();
  }
});

app.use('/auth', require('./routes/auth'));
app.use('/image', require('./routes/image'));
app.use('/profile', require('./routes/profile'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  `Server estarted on port: ${PORT}`;
});
