const express = require("express");
const { Client } = require("pg");
const cors = require('cors');
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Use CORS - allows requests from localhost:8080 (web) to localhost:3000 (server)
app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  connectionString: "postgresql://michael:wiCJxcfeRZ2bdYgxUm-VDA@damp-spider-7824.g8z.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"
});
client.connect();

// Basic test endpoint
app.get('/', (req, res) => {
    res.status(201).json({reply: "Hello World"});
})

// Endpoint to post a teacher (+ new person) to DB
app.post("/api/teacher", async (req, res) => {
    const { name, username, password } = req.body;
    const text = `
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
        WITH student_sample AS (
            INSERT INTO Person (person_name) 
            VALUES ($1) 
            RETURNING person_id
        )
        INSERT INTO Student (student_username, student_password, person_id, teacher_username)
            VALUES ($2, $3, (select person_id from student_sample), $4);
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

// Endpoint to get a student from DB using login details
app.get("/api/student", async (req, res) => {
    const { username, password } = req.query;
    const text = `
        SELECT s.student_username, s.student_password, p.person_name
        FROM Student s
        JOIN Person p ON s.person_id = p.person_id
        WHERE s.student_username = $1;    
    `;
    const values = [username];

    try {
        const result = await client.query(text, values);

        // Username not found
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Student username not found" });
            return;
        }

        // Username found but password incorrect
        const student = result.rows[0];
        if (student.student_password !== password) {
            res.status(401).json({ error: "Incorrect password" });
            return;
        }

        // Password is correct, return student details
        res.status(200).json({ 
            username: student.student_username,
            personName: student.person_name
        });
    } catch (err) {
        console.error("Error executing student login query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to get a teacher from DB using login details
app.get("/api/teacher", async (req, res) => {
    const { username, password } = req.query;
    const text = `
        SELECT t.teacher_username, t.teacher_password, p.person_name
        FROM Teacher t
        JOIN Person p ON t.person_id = p.person_id
        WHERE t.teacher_username = $1;    
    `;
    const values = [username];

    try {
        const result = await client.query(text, values);

        // Username not found
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Teacher username not found" });
            return;
        }

        // Username found but password incorrect
        const teacher = result.rows[0];
        if (teacher.teacher_password !== password) {
            res.status(401).json({ error: "Incorrect password" });
            return;
        }

        // Password is correct, return teacher details
        res.status(200).json({ 
            username: teacher.teacher_username,
            personName: teacher.person_name
        });
    } catch (err) {
        console.error("Error executing teacher login query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to get a list of students and their homework for a given teacher
app.get("/api/studentsandhomework", async (req, res) => {
    const { username } = req.query;

    // Query to fetch students and their homework details
    const text = `
        SELECT s.student_username, p.person_name, h.homework_id, h.details, h.due_date, h.complete
        FROM Student s
        JOIN Teaches t ON s.student_username = t.student_username
        JOIN Person p ON s.person_id = p.person_id
        LEFT JOIN StudentHomework sh ON s.student_username = sh.student_username
        LEFT JOIN Homework h ON sh.homework_id = h.homework_id
        WHERE t.teacher_username = $1;
    `;
    const values = [username];

    try {
        const result = await client.query(text, values);

        // Organize data into a list of students, where each student has a list of homework
        const studentsMap = new Map();
        result.rows.forEach(row => {
            if (!studentsMap.has(row.student_username)) {
                studentsMap.set(row.student_username, {
                    student_username: row.student_username,
                    person_name: row.person_name,
                    homework: []
                });
            }
            if (row.homework_id) {
                studentsMap.get(row.student_username).homework.push({
                    homework_id: row.homework_id,
                    details: row.details,
                    due_date: row.due_date,
                    complete: row.complete
                });
            }
        });

        // Convert the map to an array for the response
        const students = Array.from(studentsMap.values());
        res.status(200).json({ students });
    } catch (err) {
        console.error("Error executing students and homework query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to get a list of homework for a given student
app.get("/api/homework", async (req, res) => {
    const { username } = req.query;

    // Query to fetch students and their homework details
    const text = `
        SELECT h.homework_id, h.details, h.due_date, h.complete
        FROM Homework h
        JOIN StudentHomework sh ON h.homework_id = sh.homework_id
        WHERE sh.student_username = $1;    
    `;
    const values = [username];

    try {
        const result = await client.query(text, values);
        res.status(200).json({ homework: result.rows });
    } catch (err) {
        console.error("Error executing homework query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
