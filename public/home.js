document.addEventListener('DOMContentLoaded', async () => {
   const token = localStorage.getItem('token');
   if (!token) {
      window.location.href = 'index.html';
      return;
   }

   try {
      const response = await fetch('/expenses', {
         method: 'GET',
         headers: { 'Authorization': token }
      });

      if (response.status === 401) {
         window.location.href = 'index.html';
         return;
      }

      await loadExpenses();
   } catch (error) {
      console.error('Error verifying token:', error);
      window.location.href = 'index.html';
   }

   document.getElementById('expense-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const amount = parseFloat(document.getElementById('amount').value);
      const category = document.getElementById('category').value;
      const date = document.getElementById('date').value;

      if (isNaN(amount) || amount <= 0) {
         alert('Please enter a valid expense amount greater than 0.');
         return;
      }

      try {
         const response = await fetch('/expenses', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': token
            },
            body: JSON.stringify({ amount, category, date })
         });

         const data = await response.json();
         alert(data.message);
         await loadExpenses();
      } catch (error) {
         alert('Error adding expense');
      }
   });

   document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
   });
});

async function loadExpenses() {
   const token = localStorage.getItem('token');
   const response = await fetch('/expenses', {
      method: 'GET',
      headers: { 'Authorization': token }
   });

   const expenses = await response.json();
   const expenseList = document.getElementById('expense-list');
   expenseList.innerHTML = '';

   let totalAmount = 0;
   const categoryTotals = {};

   // Display expenses and calculate totals
   expenses.forEach(exp => {
      const div = document.createElement('div');
      div.textContent = `Amount: ${exp.amount}, Category: ${exp.category}, Date: ${exp.date}`;
      expenseList.appendChild(div);

      totalAmount += exp.amount;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
   });

   // Display total and category summaries
   const totalDiv = document.createElement('div');
   totalDiv.textContent = `Total Expenses: ${totalAmount.toFixed(2)}`;
   expenseList.appendChild(totalDiv);

   const categorySummaryDiv = document.createElement('div');
   categorySummaryDiv.textContent = 'Expenses by Category:';
   expenseList.appendChild(categorySummaryDiv);

   Object.keys(categoryTotals).forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.textContent = `${category}: ${categoryTotals[category].toFixed(2)}`;
      categorySummaryDiv.appendChild(categoryDiv);
   });

   // Generate pie chart for expenses by category
   renderPieChart(categoryTotals);
}

let expenseChart; // Define the chart variable outside of the function

function renderPieChart(categoryTotals) {
   const ctx = document.getElementById('expenseChart').getContext('2d');

   // Clear the previous chart instance if it exists
   if (expenseChart) {
      expenseChart.destroy();
   }

   const labels = Object.keys(categoryTotals);
   const data = Object.values(categoryTotals);

   // Create a new Chart instance and assign it to `expenseChart`
   expenseChart = new Chart(ctx, {
      type: 'pie',
      data: {
         labels,
         datasets: [{
            label: 'Expenses by Category',
            data,
            backgroundColor: [
               'rgba(255, 99, 132, 0.2)',
               'rgba(54, 162, 235, 0.2)',
               'rgba(255, 206, 86, 0.2)',
               'rgba(75, 192, 192, 0.2)',
               'rgba(153, 102, 255, 0.2)',
               'rgba(255, 159, 64, 0.2)',
               'rgba(50, 255, 50, 0.2)',
               'rgba(50, 50, 50, 0.2)'
            ],
            borderColor: [
               'rgba(255, 99, 132, 1)',
               'rgba(54, 162, 235, 1)',
               'rgba(255, 206, 86, 1)',
               'rgba(75, 192, 192, 1)',
               'rgba(153, 102, 255, 1)',
               'rgba(255, 159, 64, 1)',
               'rgba(50, 255, 50, 1)',
               'rgba(50, 50, 50, 1)'
            ],
            borderWidth: 1
         }]
      },
      options: {
         responsive: true,
         plugins: {
            legend: {
               position: 'top',
            },
         }
      }
   });
}
