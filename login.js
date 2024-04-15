

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const csrftoken = getCSRFToken();

    fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', username);
                window.location.href = 'board.html';
            } else {
                console.error('Login failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// csrftoken =  '1e6d680b7593d3f748133b04182f336ee54cd803';
// localStorage.setItem('token', csrftoken);



function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length, cookie.length);
        }
    }
    return null;
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
