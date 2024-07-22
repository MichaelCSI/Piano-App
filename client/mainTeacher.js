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
        let msg = response.status === 404 ? "Homework not found" : "Incorrect password";
        throw new Error(msg);    }

    const result = await response.json();
    return result;
}

// Function to compute the due date for homework in postgres format
function dueDatePostgres(daysFromNow) {
    let currentDate = new Date(new Date().getTime()+(daysFromNow * 24 * 60 * 60 * 1000));
    return currentDate.toISOString().split('T')[0]
}

// Set name in top right to teacher username
const teacherUsernameElement = document.getElementById("teacherUsername");
let personName = sessionStorage.getItem("personName");
let teacherUsername = sessionStorage.getItem("teacherUsername");
teacherUsernameElement.innerText = personName + ", " + teacherUsername;

// Fetch student list
const params = new URLSearchParams({
    username: teacherUsername
}).toString();

callEndpoint(
    `http://localhost:3000/api/studentsandhomework?${params}`, 
    "GET"
).then(result => {
    console.log('Response:', result);

    const studentWrapper = document.getElementById("studentWrapper");
    if(result.students.length < 1) {
        studentWrapper.innerText = "No Current Students";
    }

    // Add all students to teacher page
    for (let studentIndex = 0; studentIndex < result.students.length; studentIndex++) {
        const studentElement = document.createElement("div");
        studentElement.id = "studentElement" + studentIndex;
        studentElement.className = "studentBox";

        let currentStudent = result.students[studentIndex];

        let studentUsername = currentStudent.student_username;
        let name = currentStudent.person_name;
        // Add headers to new student div
        studentElement.innerHTML = `<b>${name}</b> <br> ${studentUsername} <br><br> <b>Homework<b>`;

        if(currentStudent.homework.length < 1) {
            studentElement.innerHTML += "<br>No Current Homework<br>";
        }
        // Add all homework to new student div
        for(let homeworkIndex = 0; homeworkIndex < currentStudent.homework.length; homeworkIndex++) {
            const homeworkElement = document.createElement("div");
            homeworkElement.className = "homework";
            homeworkElement.id = "homeworkElement" + studentIndex + homeworkIndex;
            let currentHomework = currentStudent.homework[homeworkIndex];
            
            homeworkElement.innerHTML = "<div><b>Homework ID: </b>" + currentHomework.homework_id + "<div>";

            homeworkElement.innerHTML += "<div><b>Details: </b>" + currentHomework.details + "<div>";
            
            const timestamp = currentHomework.due_date;
            const date = new Date(timestamp);
            const formattedDate = date.toISOString().split('T')[0];
            homeworkElement.innerHTML += "<div><b>Due: </b>" + formattedDate + "<div>";
            
            homeworkElement.innerHTML += "<div><b>Complete: </b>" + (currentHomework.complete ?  "True" : "False") + "<div>";
            studentElement.appendChild(homeworkElement);
        }
        studentElement.innerHTML += "<hr><br><b>Add Homework<b>";

        // Add homework fields and button for adding more homework for student
        const form = document.createElement('form');

        // Homework details
        const detailsLabel = document.createElement('label');
        detailsLabel.textContent = 'Homework details:';
        form.appendChild(detailsLabel);

        const detailsElement = document.createElement('input');
        detailsElement.type = 'text';
        detailsElement.placeholder = 'Example: Work on scales';
        detailsElement.required = true;
        form.appendChild(detailsElement);

        // Due date - slider for days
        const dueDateLabel = document.createElement('label');
        dueDateLabel.textContent = 'Due in (days):';
        form.appendChild(dueDateLabel);

        const dueDateElement = document.createElement('input');
        dueDateElement.type = 'range';
        dueDateElement.value = '16';
        dueDateElement.min = '1';
        dueDateElement.max = '31';
        dueDateElement.oninput = function() {
            this.nextElementSibling.innerHTML = this.value + "<br><br>";
        };
        form.appendChild(dueDateElement);

        const dueDateOutput = document.createElement('output');
        dueDateOutput.innerHTML = '16<br><br>';
        form.appendChild(dueDateOutput);

        // Submit button
        const addHomeworkButton = document.createElement('button');
        addHomeworkButton.type = 'submit';
        addHomeworkButton.className = 'addHomework';
        addHomeworkButton.textContent = 'Add Homework';
        form.appendChild(addHomeworkButton);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            let dueDate = dueDatePostgres(dueDateElement.value);

            // Update DB value and UI with refresh
            callEndpoint(
                `http://localhost:3000/api/homework`, 
                "POST", 
                {
                    username: studentUsername,
                    details: detailsElement.value,
                    dueDate: dueDate
                }
            )
            .then(result => {
                console.log('Response:', result);
                window.location.reload();
            }).catch(error => {
                console.error(error);
            });
        });
        studentElement.appendChild(form);

        
        
        // Form for deleting homework for current student
        studentElement.innerHTML += "<hr><br><b>Delete Homework<b>";
       
        const errorMsg = document.createElement('h4');
        errorMsg.id = "errorMsg";
        studentElement.appendChild(errorMsg);

        const formDelete = document.createElement('form')
        const idLabel = document.createElement('label');
        idLabel.textContent = 'Homework ID:';
        formDelete.appendChild(idLabel);

        const idInput = document.createElement('input');
        idInput.type = 'number';
        idInput.placeholder = 'Example: 010101010101010101';
        idInput.required = true;
        formDelete.appendChild(idInput);

        const removeHomeworkButton = document.createElement('button');
        removeHomeworkButton.type = 'submit';
        removeHomeworkButton.className = 'addHomework';
        removeHomeworkButton.textContent = 'Delete Homework';
        formDelete.appendChild(removeHomeworkButton);
        
        formDelete.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("HELLO");
            const deleteParams = new URLSearchParams({
                username: currentStudent.student_username,
                homeworkId: idInput.value
            }).toString();
        
            callEndpoint(
                `http://localhost:3000/api/homework?${deleteParams}`,
                "DELETE"
            )
            .then(result => {
                console.log('Response:', result);
                window.location.reload();
            }).catch(error => {
                console.error(error);
            });
        });
        studentElement.appendChild(formDelete);
        studentWrapper.appendChild(studentElement);
    }
}).catch(error => {
    console.error(error);
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = error;
});