function fetchPerson() {
    try {
        const response = await fetch('/api/person', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, age })
        });
    
        if (response.ok) {
          const person = await response.json();
          console.log('Person inserted:', person);
        } else {
          console.error('Failed to insert person');
        }
      } catch (error) {
        console.error('Error:', error);
    }
}