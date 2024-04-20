async function logout() {
    const token = localStorage.getItem('token'); 
    if (!token) {
        console.error('No token found. User is not logged in.');
        return;
    }

    try {
        const csrftoken = getCSRFTokenFromCookie();

        const response = await fetch('http://127.0.0.1:8000/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`, 
                'X-CSRFToken': csrftoken 
            }
        });
        console.log('response', response);
        if (response.ok) {
            console.log('Logout successful');
            window.location.href = 'index.html';
            localStorage.removeItem('token');
            localStorage.removeItem('username');
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function getCSRFTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length);
        }
    }
    return null;
}
