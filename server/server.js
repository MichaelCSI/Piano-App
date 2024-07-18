const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const client = new Client({
  connectionString: process.env.DATABASE_URL,  // TODO: DONT FORGET TO PROVIDE URL i.e. export DATABASE_URL="..."
});

client.connect();

app.post('/api/person', async (req, res) => {
  const { name, age } = req.body;
  const text = 'INSERT INTO person (name, age) VALUES ($1, $2) RETURNING *';
  const values = [name, age];

  try {
    const result = await client.query(text, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
