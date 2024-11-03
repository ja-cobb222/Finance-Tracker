// script.js
document.getElementById('signup-form').addEventListener('submit', async (event) => {
   event.preventDefault(); // Prevent the default form submission
   const username = document.getElementById('signup-username').value;
   const password = document.getElementById('signup-password').value;

   try {
      const response = await fetch('/signup', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      document.getElementById('message').innerText = data.message || data.error; // Display success or error message

   } catch (error) {
      document.getElementById('message').innerText = 'Error occurred during signup';
   }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
   event.preventDefault(); // Prevent the default form submission
   const username = document.getElementById('login-username').value;
   const password = document.getElementById('login-password').value;

   try {
      const response = await fetch('/login', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      document.getElementById('message').innerText = data.message || data.error; // Display success or error message
      if (response.ok) {
         // Save the token to local storage
         localStorage.setItem('token', data.token);
         window.location.href = 'home.html'; // Redirect to the home page
      } else {
         alert(data.error); // Show the error message
      }
   } catch (error) {
      alert('Error logging in');
   }
});
