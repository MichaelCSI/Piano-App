// Generic function for calling our API get/post methods
async function callEndpoint(endpoint, method, data = null) {
    const options = {
        method: method,
        headers: { "Content-Type": "application/json" }
    };

    // Only include body for post method
    if (method === "POST" && data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    if (!response.ok) {
        let msg = response.status === 404 ? "Username not found" : "Incorrect password";
        throw new Error(msg);
    }

    const result = await response.json();
    return result;
}

// Set name in top right to teacher username
const teacherUsername = document.getElementById("teacherUsername");
let personName = sessionStorage.getItem("teacherName");
let username = sessionStorage.getItem("teacherUsername");
teacherUsername.innerText = personName + ", " + username;

// Fetch student list
const params = new URLSearchParams({
    username: username
}).toString();

callEndpoint(
    `http://localhost:3000/api/studentsandhomework?${params}`, 
    "GET"
).then(result => {
    console.log('Response:', result);

    // Add all students to teacher page
    for (let studentIndex = 0; studentIndex < result.students.length; studentIndex++) {
        let studentElement = document.createElement("div");
        studentElement.className = "studentBox";
        studentElement.id = "student" + studentIndex;

        let currentStudent = result.students[studentIndex];

        let username = currentStudent.student_username;
        let name = currentStudent.person_name;
        // Add headers to new student div
        studentElement.innerHTML = `<b>${name}</b> <br> ${username} <br><br> <b>Homework<b>`;

        // Add all homework to new student div
        for(let homeworkIndex = 0; homeworkIndex < currentStudent.homework.length; homeworkIndex++) {
            let homeworkElement = document.createElement("div");
            homeworkElement.className = "homework";
            homeworkElement.id = "homework" + studentIndex;

            let currentHomework = currentStudent.homework[homeworkIndex];
           
            homeworkElement.innerHTML = "<div><b>Details: </b>" + currentHomework.details + "<div>";
            
            const timestamp = currentHomework.due_date;
            const date = new Date(timestamp);
            const formattedDate = date.toISOString().split('T')[0];
            homeworkElement.innerHTML += "<div><b>Due: </b>" + formattedDate + "<div>";
            
            homeworkElement.innerHTML += "<div><b>Complete: </b>" + (currentHomework.complete ?  "True" : "False") + "<div>";
            
            studentElement.appendChild(homeworkElement);
        }
        
        const studentWrapper = document.getElementById("studentWrapper");
        studentWrapper.appendChild(studentElement);
    }
}).catch(error => {
    console.error(error);
});