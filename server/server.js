require("dotenv").config({path:__dirname+"/./../.env"});
const express = require("express");
const { Client } = require("pg");
const cors = require('cors');
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Use CORS - allows requests from localhost:8080 (web) to localhost:3000 (server)
app.use(cors());
app.use(bodyParser.json());

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: 'defaultdb',
    port: process.env.PORT,
    ssl: {
      rejectUnauthorized: false
    }
  });
client.connect();

// Basic test endpoint
app.get('/api', async (req, res) => {
    const text = `
        SELECT * FROM Person;
    `;
    const result = await client.query(text);

    res.status(201).json({reply: "Hello World"});
})

// Endpoint to post a teacher (+ new person) to DB
app.post("/api/createteacher", async (req, res) => {
    const { username, password, name } = req.body;

    // Check if teacher username already exists
    const checkUsernameText = `
        SELECT 1 FROM Teacher WHERE teacher_username = $1
    `;

    const insertText = `
        WITH new_person AS (
            INSERT INTO Person (person_name) 
            VALUES ($3) 
            RETURNING person_id
        )
        INSERT INTO Teacher (teacher_username, teacher_password, person_id)
            VALUES ($1, $2, (SELECT person_id FROM new_person));
    `;

    try {
        // Check if the username already exists
        const usernameCheckResult = await client.query(checkUsernameText, [username]);
        if (usernameCheckResult.rowCount > 0) {
            res.status(400).json({ error: "Teacher username already exists" });
            return;
        }

        // Insert new person and teacher
        const values = [username, password, name];
        const result = await client.query(insertText, values);
        res.status(200).json({ 
            msg: "Inserted teacher",
            username: username,
            password: password
        });
    } catch (err) {
        console.error("Error executing teacher query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Endpoint to post a student (+ new person) to DB
app.post("/api/createstudent", async (req, res) => {
    const { studentUsername, password, name, teacherUsername } = req.body;

    // Check if student username already exists
    const checkUsernameText = `
        SELECT 1 FROM Student WHERE student_username = $1
    `;

    const checkTeacherExists = `
        SELECT 1 FROM Teacher WHERE teacher_username = $1
    `;

    const insertTextStudent = `
        WITH new_person AS (
            INSERT INTO Person (person_name) 
            VALUES ($3) 
            RETURNING person_id
        )
        INSERT INTO Student (student_username, student_password, person_id, teacher_username)
            VALUES ($1, $2, (SELECT person_id FROM new_person), $4);
    `;

    const insertTextTeaches = `
        INSERT INTO Teaches (teacher_username, student_username) 
            VALUES ($1, $2);
    `

    try {
        // Check if the student username already exists
        const usernameCheckResult = await client.query(checkUsernameText, [studentUsername]);
        if (usernameCheckResult.rowCount > 0) {
            res.status(400).json({ error: "Student username already exists" });
            return;
        }

        // Check if the teacher they are trying to assign exists
        const teacherCheckResult = await client.query(checkTeacherExists, [teacherUsername]);
        if (teacherCheckResult.rowCount === 0) {
            res.status(401).json({ error: "Teacher does not exist" });
            return;
        }

        // Insert new person and student
        const values = [studentUsername, password, name, teacherUsername];
        const insertStudentResult = await client.query(insertTextStudent, values);

        // Insert new student-teacher relation in teaches table
        const insertTeachesResult = await client.query(insertTextTeaches, [teacherUsername, studentUsername]);

        res.status(200).json({ 
            msg: "Inserted student",
            username: studentUsername,
            password: password,
            teacherUsername: teacherUsername
        });
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
        if (result.rowCount === 0) {
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

// Endpoint to toggle completion status of homework to true/false, returning new comlpete value
app.put("/api/homeworkcomplete", async (req, res) => {
    const { homeworkId } = req.query;

    // Query to fetch current complete value and update it
    const selectText = `
        SELECT complete
        FROM Homework
        WHERE homework_id = $1;
    `;
    
    const updateText = `
        UPDATE Homework
        SET complete = NOT complete
        WHERE homework_id = $1
        RETURNING complete;
    `;

    try {
        // Fetch current complete value
        const selectResult = await client.query(selectText, [homeworkId]);
        if (selectResult.rows.length === 0) {
            return res.status(404).json({ error: "Homework not found" });
        }

        // Update complete value and return new value
        const updateResult = await client.query(updateText, [homeworkId]);
        const newCompleteValue = updateResult.rows[0].complete;

        res.status(200).json({ complete: newCompleteValue });
    } catch (err) {
        console.error("Error executing homework query", err.stack);
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

// Endpoint to add new homework (added in Homework and StudentHomework tables)
app.post("/api/homework", async (req, res) => {
    const { username, details, dueDate } = req.body;

    const text = `
        WITH new_homework AS (
            INSERT INTO Homework (details, due_date, complete)
            VALUES ($2, $3, $4)
            RETURNING homework_id
        )
        INSERT INTO StudentHomework (student_username, homework_id)
            VALUES ($1, (SELECT homework_id FROM new_homework));
    `;

    try {
        // Insert into Homework and StudentHomework table
        const result = await client.query(text, [username, details, dueDate, false]);
        res.status(200).json({ 
            msg: "Inserted Homework",
            username: username,
            details: details
        });
    } catch (err) {
        console.error("Error executing teacher query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to delete homework from Homework and StudentHomework tables
app.delete("/api/homework", async (req, res) => {
    const { username, homeworkId } = req.query;

    const findHomeworkText = `
        SELECT *
        FROM StudentHomework
        WHERE student_username = $1 AND homework_id = $2;
    `

    const deleteStudentHomeworkText = `
        DELETE FROM StudentHomework
        WHERE student_username = $1
        AND homework_id = $2;    
    `;

    const deleteHomeworkText = `
        DELETE FROM StudentHomework
        WHERE homework_id = $1;
    `;

    try {
        // Check that homework exists
        const result = await client.query(findHomeworkText, [username, homeworkId]);

        // Homework not found
        if (result.rowCount === 0) {
            res.status(404).json({ error: "Homework not found" });
            return;
        }

        // Delete from Homework and StudentHomework table
        const resultStudentHomework = await client.query(deleteStudentHomeworkText, [username, homeworkId]);
        const resultHomework = await client.query(deleteHomeworkText, [homeworkId]);

        res.status(200).json({ 
            msg: "Deleted Homework",
            username: username,
            homeworkId: homeworkId
        });
    } catch (err) {
        console.error("Error executing teacher query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
