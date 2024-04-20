async function logout() {
    const token = localStorage.getItem('token'); // Token aus dem Local Storage abrufen
    if (!token) {
        console.error('No token found. User is not logged in.');
        return;
    }

    try {
        // CSRF-Token aus dem Cookie extrahieren
        const csrftoken = getCSRFTokenFromCookie();

        // HTTP-Anfrage an den Server senden, um den Logout-Prozess auszulösen
        const response = await fetch('http://127.0.0.1:8000/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`, // Token im Header senden
                'X-CSRFToken': csrftoken // CSRF-Token im Header senden
            }
        });
console.log('response', response);
        if (response.ok) {
            console.log('Logout successful');
            // Weiterleitung zum Login-Bildschirm oder einer anderen Seite
            window.location.href = 'index.html';
            // Token aus dem Local Storage löschen
            localStorage.removeItem('token');
            localStorage.removeItem('username');
        } else {
            console.error('Logout failed');
            // Handle logout failure
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle error
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
