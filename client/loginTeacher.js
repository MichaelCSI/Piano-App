// Generic function for calling our API get/post methods with error msg relating to login
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

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    const params = new URLSearchParams({
        username: username.value,
        password: password.value
    }).toString();

    const url = process.env.PRODUCTION ? "https://piano-app-production.up.railway.app/" : "http://localhost:3000/";
    callEndpoint(
        `${url}api/teacher?${params}`, 
        "GET"
    ).then(result => {
        console.log('Response:', result);
        sessionStorage.setItem("personName", result.personName);
        sessionStorage.setItem("teacherUsername", result.username);
        window.location.href = "http://localhost:8080/mainTeacher.html";
    }).catch(error => {
        console.error(error);
        const errorMsg = document.getElementById("errorMsg");
        errorMsg.innerText = error;
    });
});