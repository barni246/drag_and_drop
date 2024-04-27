
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('http://127.0.0.1:8000/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': `${getCSRFToken()}`
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
                document.getElementById('error-message-login').innerText = 'Login failed'; 
            }
        } else {
            console.error('Login failed');
            document.getElementById('error-message-login').innerText = 'Login failed'; 
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-login').innerText = 'Error: ' + error.message; 
    }
}


function toRegister() {
    window.location.href = 'register.html';
}

