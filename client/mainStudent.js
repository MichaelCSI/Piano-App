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
        throw new Error("Status: " + response.status);
    }

    const result = await response.json();
    return result;
}

// Set name in top right to student username
const studentUsername = document.getElementById("studentUsername");
let personName = sessionStorage.getItem("personName");
let username = sessionStorage.getItem("username");
studentUsername.innerText = personName + ", " + username;


// Fetch student list
const params = new URLSearchParams({
    username: username
}).toString();

const url = process.env.PRODUCTION ? "https://piano-app-production.up.railway.app/" : "http://localhost:3000/";
callEndpoint(
    `${url}api/homework?${params}`, 
    "GET"
).then(result => {
    console.log('Response:', result);

    const homeworkWrapper = document.getElementById("homeworkWrapper");
    if(result.homework.length < 1) {
        homeworkWrapper.innerText = "No Current Homework";
    }

    // Add all homework to student page
    for (let homeworkIndex = 0; homeworkIndex < result.homework.length; homeworkIndex++) {
        const homeworkBox = document.createElement("div");
        homeworkBox.className = "homeworkBox";
        homeworkBox.innerHTML = `<b>Homework Item ${homeworkIndex + 1}</b>`;

        const homeworkElement = document.createElement("div");
        homeworkElement.className = "homework";
        homeworkElement.id = "homework" + homeworkIndex;
        let currentHomework = result.homework[homeworkIndex];
    
        homeworkElement.innerHTML = "<div><b>Details: </b>" + currentHomework.details + "<div>";
        
        const timestamp = currentHomework.due_date;
        const date = new Date(timestamp);
        const formattedDate = date.toISOString().split('T')[0];
        homeworkElement.innerHTML += "<div><b>Due: </b>" + formattedDate + "<div>";
        
        const completeText = document.createElement("div");
        completeText.id = "completeText" + homeworkIndex;
        completeText.innerHTML = "<b>Complete: </b>" + (currentHomework.complete ?  "True \u2714" : "False \u2716");
        homeworkElement.appendChild(completeText);

        // Button to mark homework as complete/incomplete
        const completeHwButton = document.createElement("button");
        completeHwButton.className = "completeButton";
        completeHwButton.id = "completeButton" + homeworkIndex;
        completeHwButton.innerText = "Toggle Complete / Incomplete";
        completeHwButton.onclick = () => {
            console.log("CLICK");
            // Update DB value and UI for completeText element
            const completeParams = new URLSearchParams({
                homeworkId: currentHomework.homework_id
            }).toString();
            
            callEndpoint(
                `${url}api/homeworkcomplete?${params}`, 
                "PUT"
            )
            .then(result => {
                console.log('Response:', result);
                completeText.innerHTML = "<b>Complete: </b>" + (result.complete ?  "True \u2714" : "False \u2716");
            }).catch(error => {
                console.error(error);
            });
        }
        homeworkElement.appendChild(completeHwButton);
        
        homeworkBox.appendChild(homeworkElement);
        
        homeworkWrapper.appendChild(homeworkBox);
    }
}).catch(error => {
    console.error(error);
});
