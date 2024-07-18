# CSI 3140 Assignment 4: Web application (Piano Homework App)
Michael O'Sullivan and Demian Oportus

----

This is a web app to help piano students/teachers manage homework week-to-week. Students and teachers both have login credentials and every student is associated to a teacher. Students can view their homework and mark as complete/incomplete, and teachers can assign homework and remove homework that has been complete.

Example workflow
  - Person A opens the website, creates account as Teacher with name/username/password
      - Teacher can now login and see account information (i.e. teacherId) and students
  - Person B opens the website, creates account as Student with name/username/password/teacherId
      - Student can now login and see account information and homework

Technology used
   HTML/CSS frontend + JS for client interactions
   Node JS for server interactions + Postgres (CockroachDB) for managing data

## Steps to run:
> You will need [Node](https://nodejs.org/en) installed on your machine

1. Download or clone the repository

2. Set up the server. In the command line for the project:
    1. Navigate to the server folder: `cd server`
    2. Install dependencies: `npm install`
    3. Start the server: `node server.js`

3. Start using the app (Open client.html in you browser)
