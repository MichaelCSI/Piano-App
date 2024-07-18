-- This file shows the setup of our postgres database

CREATE TABLE Person (
    person_id SERIAL PRIMARY KEY,
    person_name VARCHAR(50) NOT NULL
);

CREATE TABLE Teacher (
    teacher_username VARCHAR(50) PRIMARY KEY,
    teacher_password VARCHAR(50) NOT NULL,
    person_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(person_id)
);

CREATE TABLE Student (
    student_username VARCHAR(50) PRIMARY KEY,
    student_password VARCHAR(50) NOT NULL,
    person_id INT NOT NULL,
    teacher_username VARCHAR(50) NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(person_id),
    FOREIGN KEY (teacher_username) REFERENCES Teacher(teacher_username)
);

CREATE TABLE Teaches (
    teacher_username VARCHAR(50),
    student_username VARCHAR(50),
    PRIMARY KEY (teacher_username, student_username),
    FOREIGN KEY (teacher_username) REFERENCES Teacher(teacher_username),
    FOREIGN KEY (student_username) REFERENCES Student(student_username)
);

CREATE TABLE Homework (
    homework_id SERIAL PRIMARY KEY,
    details VARCHAR(100) NOT NULL,
    due_date DATE,
    complete BOOLEAN DEFAULT FALSE
);

CREATE TABLE StudentHomework (
    student_username VARCHAR(50),
    homework_id INT,
    PRIMARY KEY (student_username, homework_id),
    FOREIGN KEY (student_username) REFERENCES Student(student_username),
    FOREIGN KEY (homework_id) REFERENCES Homework(homework_id)
);


-- Sample population for the DB is shown below with a student, teacher, and homework assignment

-- Create teacher
WITH teacher_sample AS (
    INSERT INTO Person (person_name) 
    VALUES ('Piano Teacher #3') 
    RETURNING person_id
)
INSERT INTO Teacher (teacher_username, teacher_password, person_id)
    VALUES ('usernameTeacher', 'password', (select person_id from teacher_sample));

-- Create student
WITH student_sample AS (
    INSERT INTO Person (person_name) 
    VALUES ('Michael OSullivan') 
    RETURNING person_id
) 
INSERT INTO Student (student_username, student_password, person_id, teacher_username) 
    VALUES ('usernameStudent', 'password', (select person_id from student_sample), 'usernameTeacher');

-- Assign student to teacher
INSERT INTO Teaches (teacher_username, student_username) 
    VALUES ('usernameTeacher', 'usernameStudent');

-- Create homework
WITH homework_sample AS (
    INSERT INTO Homework (details, due_date, complete)
    VALUES ('Work on Solfeggio - focus on clarity', '2024-07-25', FALSE)
    RETURNING homework_id
) 
-- Assign homework to student
INSERT INTO StudentHomework (student_username, homework_id) 
    VALUES ('usernameStudent', (select homework_id from homework_sample));

