async function create_new_user() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const newEmail = document.getElementById('newEmail').value;
    const csrftoken = getCSRFToken();
    const response = await fetch('http://127.0.0.1:8000/create_user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ newUsername, newPassword, newEmail })
    });
  
    if (response.ok) {
        const data = await response.json();
        toLogin();
        console.log('User created:', data);
    } else {
      const errorData = await response.json(); 
      console.error('Failed to create user:', errorData.error);
      document.getElementById('error-message').innerText = errorData.error;
    }
  }

  function toLogin() {
    window.location.href = 'index.html';
  }