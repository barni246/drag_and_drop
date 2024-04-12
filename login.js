const message = document.getElementById('message');

function loginToBackend() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://127.0.0.1:8000/login/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      if (data.token) {
          // Erfolgreich eingeloggt
          // Speichern Sie das Token in localStorage oder Cookies
          localStorage.setItem('token', data.token);
          // Umleitung zu einer anderen Seite
          window.location.href = '/dashboard';
      } else {
          // Fehler beim Einloggen
          document.getElementById('message').textContent = 'Invalid username or password';
      }
  })
  .catch(error => {
      console.error('Error:', error);
      // Behandlung von Fetch-Fehlern
      document.getElementById('message').textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
  });
}


