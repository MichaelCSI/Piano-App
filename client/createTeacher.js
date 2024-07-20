// Generic function for calling our API get/post methods with error msg relating to account creation
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
        let msg = response.status === 400 ? "Username already exists" : "Unknown error occured";
        throw new Error(msg);
    }

    const result = await response.json();
    return result;
}

document.getElementById("createForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name");
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    callEndpoint(
        `http://localhost:3000/api/createteacher`, 
        "POST",
        {
            name: name.value,
            username: username.value,
            password: password.value,
        }
    ).then(result => {
        console.log('Response:', result);
        const msgElement = document.getElementById("successOrFail");
        msgElement.style.color = 'green';
        msgElement.innerText = "Account Created";
    }).catch(error => {
        console.error(error);
        const msgElement = document.getElementById("successOrFail");
        msgElement.style.color = 'red';
        msgElement.innerText = error;
    });
});