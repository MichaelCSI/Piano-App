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

// Set name in top right to student username
const studentUsername = document.getElementById("studentUsername");
let personName = sessionStorage.getItem("studentName");
let username = sessionStorage.getItem("studentUsername");
studentUsername.innerText = personName + ", " + username;


// Fetch student list
const params = new URLSearchParams({
    username: username
}).toString();

callEndpoint(
    `http://localhost:3000/api/homework?${params}`, 
    "GET"
).then(result => {
    console.log('Response:', result);

    // Add all homework to student page
    for (let homeworkIndex = 0; homeworkIndex < result.homework.length; homeworkIndex++) {
        let homeworkBox = document.createElement("div");
        homeworkBox.className = "homeworkBox";
        homeworkBox.innerHTML = `<b>Homework Item ${homeworkIndex + 1}</b>`;

        let homeworkElement = document.createElement("div");
        homeworkElement.className = "homework";
        homeworkElement.id = "homework" + homeworkIndex;
        let currentHomework = result.homework[homeworkIndex];
    
        homeworkElement.innerHTML = "<div><b>Details: </b>" + currentHomework.details + "<div>";
        
        const timestamp = currentHomework.due_date;
        const date = new Date(timestamp);
        const formattedDate = date.toISOString().split('T')[0];
        homeworkElement.innerHTML += "<div><b>Due: </b>" + formattedDate + "<div>";
        
        homeworkElement.innerHTML += "<div><b>Complete: </b>" + (currentHomework.complete ?  "True" : "False") + "<div>";
        
        homeworkBox.appendChild(homeworkElement);
        
        const homeworkWrapper = document.getElementById("homeworkWrapper");
        homeworkWrapper.appendChild(homeworkBox);
    }
}).catch(error => {
    console.error(error);
});
