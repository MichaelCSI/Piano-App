const express = require("express");
const { Client } = require("pg");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const client = new Client({
  connectionString: process.env.DATABASE_URL, // TODO: DONT FORGET TO PROVIDE URL i.e. export DATABASE_URL="..."
});

client.connect();

// Endpoint to post a teacher (+ new person) to DB
app.post("/api/teacher", async (req, res) => {
    const { name, username, password } = req.body;
    const text = `
        INSERT INTO Person (person_name) VALUES ($1) RETURNING *';
        WITH teacher_sample AS (
            INSERT INTO Person (person_name) 
            VALUES ($1) 
            RETURNING person_id
        )
        INSERT INTO Teacher (teacher_username, teacher_password, person_id)
            VALUES ($2, $3, (select person_id from teacher_sample));
        `;
    const values = [name, username, password];

    try {
        const result = await client.query(text, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error executing teacher query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to post a student (+ new person) to DB
app.post("/api/student", async (req, res) => {
    const { name, studentUsername, password, teacherUsername } = req.body;
    const text = `
        INSERT INTO Person (person_name) VALUES ($1) RETURNING *';
        WITH student_sample AS (
            INSERT INTO Person (person_name) 
            VALUES ($1) 
            RETURNING person_id
        )
        INSERT INTO Student (student_username, student_password, person_id, teacher_username)
            VALUES ($2, $3, (select person_id from teacher_sample), $4);
        `;
    const values = [name, studentUsername, password, teacherUsername];

    try {
        const result = await client.query(text, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error executing teacher query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
