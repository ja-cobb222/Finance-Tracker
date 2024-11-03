const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { initializeDatabase, addUser, findUser, addExpense, getExpenses } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'mysecretkey';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the PostgreSQL database and tables
initializeDatabase().then(() => console.log("Database initialized."));

// Route for user signup
app.post('/signup', async (req, res) => {
   const { username, password } = req.body;
   const existingUser = await findUser(username);

   if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
   }

   const hashedPassword = await bcrypt.hash(password, 10);
   await addUser(username, hashedPassword);
   res.json({ message: 'User registered successfully!' });
});

// Route for user login
app.post('/login', async (req, res) => {
   const { username, password } = req.body;
   const user = await findUser(username);

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
app.post('/expenses', authenticateToken, async (req, res) => {
   const { amount, category, date } = req.body;
   await addExpense(req.user.username, amount, category, date);
   res.json({ message: 'Expense added successfully!' });
});

// Route to retrieve all expenses for the logged-in user
app.get('/expenses', authenticateToken, async (req, res) => {
   const userExpenses = await getExpenses(req.user.username);
   res.json(userExpenses);
});

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});
