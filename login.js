
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const csrftoken = getCSRFToken();

    try {
        const response = await fetch('http://127.0.0.1:8000/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                console.log('Login successful');
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', username);
                window.location.href = 'board.html';
            } else {
                console.error('Login failed');
                document.getElementById('error-message-login').innerText = 'Login failed'; // Fehlermeldung anzeigen
            }
        } else {
            console.error('Login failed');
            document.getElementById('error-message-login').innerText = 'Login failed'; // Fehlermeldung anzeigen
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-login').innerText = 'Error: ' + error.message; // Fehlermeldung anzeigen
    }
}



 function getCSRFToken() {
   const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            return  cookie.substring('csrftoken='.length, cookie.length);
        }
    }
    return null;
}


function toRegister() {
    window.location.href = 'register.html';
}


// csak ha kell a kesöbbiekben
function fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token not found in localStorage');
        return;
    }

    fetch('http://127.0.0.1:8000/tasks/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Verwenden Sie das Token im Authorization-Header
        }
    })
        .then(response => response.json())
        .then(data => {
            // Verarbeiten Sie die Antwort vom Server
            console.log('Tasks:', data);
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
        });
}
