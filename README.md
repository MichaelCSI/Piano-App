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
  - From project directory, open a terminal window and run `npm start` 
    - This command runs `http-server` for client and `node server.js` for server
  - Navigate to `http://localhost:8080` in browser, a link should appear in the terminal window

4. Use the application
  - For the sake of testing, the DB is already populated with at least one student and teacher
    - Student login: {username : usernameStudent, password : password}
    - Teacher login: {username : usernameTeacher, password : password}
  - NOTE: For some reason, maybe due to http-server, login attemps don't work on 1st try, so if you login and see an empty page, navigate back to the login page and retry, it should work


## User documentation

Our application has two types of users: Students (basic users) and Teachers (like admins).

Students can create an account with a name, unique username, password, and the username of their teacher. They can then log into this account with their username and password and see homework their teacher as assigned, as well as being able to mark it as complete/incomplete. Teachers, similarly to students, can create an account with a name, unique username, and password, and can see their students, as well as assign/remove homework.

## Screenshots
![Screenshot 1](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/home.png)
![Screenshot 2](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/studentLogin.png)
![Screenshot 3](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/studentCreate.png)
![Screenshot 4](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/studentMain.png)
![Screenshot 5](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/teacherLogin.png)
![Screenshot 6](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/teacherCreate.png)
![Screenshot 7](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/teacherMain.png)
![Screenshot 8](https://github.com/MichaelCSI/piano-app/blob/master/docs/images/teacherMain2.png)

