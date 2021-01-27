const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

client.connect();

module.exports = client;
