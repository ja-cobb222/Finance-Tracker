// Import required modules
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For generating tokens
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'mysecretkey'; // Secret key for JWT

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Placeholder for user data (replace with a database in production)
let users = [];
let expenses = [];

// Route for user signup
app.post('/signup', async (req, res) => {
   const { username, password } = req.body;
   const existingUser = users.find(user => user.username === username);
   if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
   }

   const hashedPassword = await bcrypt.hash(password, 10);
   users.push({ username, password: hashedPassword });
   res.json({ message: 'User registered successfully!' });
});

// Route for user login
app.post('/login', async (req, res) => {
   const { username, password } = req.body;
   const user = users.find(user => user.username === username);
   if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
   }

   const isPasswordCorrect = await bcrypt.compare(password, user.password);
   if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid username or password.' });
   }

   const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
   res.json({ message: 'Login successful!', token });
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
   const token = req.headers['authorization'];
   if (!token) return res.sendStatus(401);

   jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
   });
}

// Route to add a new expense
app.post('/expenses', authenticateToken, (req, res) => {
   const { amount, category, date } = req.body;
   expenses.push({ username: req.user.username, amount, category, date });
   res.json({ message: 'Expense added successfully!' });
});

// Route to retrieve all expenses for the logged-in user
app.get('/expenses', authenticateToken, (req, res) => {
   const userExpenses = expenses.filter(exp => exp.username === req.user.username);
   res.json(userExpenses);
});

// CSV export route
const { Parser } = require('json2csv');

app.get('/export', authenticateToken, (req, res) => {
   const userExpenses = expenses.filter(exp => exp.username === req.user.username);
   const fields = ['username', 'amount', 'category', 'date'];
   const json2csvParser = new Parser({ fields });
   const csv = json2csvParser.parse(userExpenses);

   res.header('Content-Type', 'text/csv');
   res.attachment('expenses.csv');
   res.send(csv);
});

// Add the following line to log when the server starts
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
