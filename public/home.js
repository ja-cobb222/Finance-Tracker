// home.js
document.addEventListener('DOMContentLoaded', async () => {
   // Check if user is logged in
   const token = localStorage.getItem('token');
   if (!token) {
      window.location.href = 'index.html'; // Redirect to the login page if not logged in
      return; // Stop execution if there's no token
   }

   // Verify token with the server to ensure it's valid
   try {
      const response = await fetch('/expenses', {
         method: 'GET',
         headers: {
            'Authorization': token // Send token with request
         }
      });

      if (response.status === 401) {
         // If the server responds with 401, redirect to the login page
         window.location.href = 'index.html';
         return;
      }

      await loadExpenses(); // Load and display user's expenses if token is valid
   } catch (error) {
      console.error('Error verifying token:', error);
      window.location.href = 'index.html'; // Redirect to login on error
   }

   // Handle expense form submission
   document.getElementById('expense-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const amount = parseFloat(document.getElementById('amount').value);
      const category = document.getElementById('category').value;
      const date = document.getElementById('date').value;

      if (isNaN(amount) || amount <= 0) {
         alert('Please enter a valid expense amount greater than 0.');
         return; // Exit the function if the amount is invalid
      }

      try {
         const response = await fetch('/expenses', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': token // Send token with request
            },
            body: JSON.stringify({ amount, category, date })
         });

         const data = await response.json();
         alert(data.message);
         await loadExpenses(); // Reload expenses after adding
      } catch (error) {
         alert('Error adding expense');
      }
   });

   // Handle logout
   document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('token'); // Remove the token from local storage
      window.location.href = 'index.html'; // Redirect to the login page
   });
});

// Function to load expenses from the server
async function loadExpenses() {
   const token = localStorage.getItem('token');
   const response = await fetch('/expenses', {
      method: 'GET',
      headers: {
         'Authorization': token // Send token with request
      }
   });

   const expenses = await response.json();
   const expenseList = document.getElementById('expense-list');

   // Clear existing expenses
   expenseList.innerHTML = '';

   // Display each expense
   expenses.forEach(exp => {
      const div = document.createElement('div');
      div.textContent = `Amount: ${exp.amount}, Category: ${exp.category}, Date: ${exp.date}`;
      expenseList.appendChild(div);
   });
}
