// Generic function for calling our API post methods
async function postData(endpoint, data) {
    try {
        const response = await fetch("/api/"+endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("HTTP error for /api/" + endpoint + `Status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error posting data to /api/" + endpoint, error);
        throw error;
    }
}

// Example usage
postData('/api/teacher', {
    name: 'John Doe',
    username: 'johndoe',
    password: 'securepassword123'
}).then(result => {
    console.log('Response:', result);
}).catch(error => {
    console.error('Error:', error);
});
