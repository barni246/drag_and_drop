async function logout() {
    try {
        const response = await fetch('http://127.0.0.1:8000/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${getToken()}`,
                'X-CSRFToken': `${getCSRFToken()}`
            }
        });
        if (response.ok) {
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

