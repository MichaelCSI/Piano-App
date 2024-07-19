# CSI 3140 Assignment 4: Web application (Piano Homework App)
Michael O'Sullivan and Demian Oportus

----

This is a web app to help piano students/teachers manage homework week-to-week. Students and teachers both have login credentials and every student is associated to a teacher. Students can view their homework and mark items as complete/incomplete. Teachers can assign new homework and remove old homework that may or may not have been completed.

Example workflow
  - Person A opens the website, creates account as Teacher with name/username/password
      - Teacher can now login and see account information (i.e. teacherId) and students
  - Person B opens the website, creates account as Student with name/username/password/teacherId
      - Student can now login and see account information and homework

Technology used
  - HTML/CSS frontend + JS for client interactions
  - Node JS for server interactions + Postgres (CockroachDB) for managing data

## Steps to run the application
> You will need [Node](https://nodejs.org/en) installed on your machine

1. Download or clone the repository

2. Install dependencies: In the command line for the project run `npm install`

3. Start client and server
  - Navigate to server directory `cd server` and run `node server.js`
  - Navigate to client directory `cd client` and run `http-server`
    - Navigate to `http://localhost:8080` in browser
    - Note: Running `http-server` will output in terminal which address the web app is on

4. Use the application
  - For the sake of testing, the DB is already populated with at least one student and teacher
    - Student login: {username : usernameStudent, password : password}
    - Teacher login: {username : usernameTeacher, password : password}


## User documentation

Our application has two types of users: Students (basic users) and Teachers (like admins).

Students... { Full user description and explanation here - how to use the application, maybe with screenshots }

