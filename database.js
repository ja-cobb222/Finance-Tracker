const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
   ssl: {
      rejectUnauthorized: false,
   },
});

// Function to initialize tables for users and expenses
async function initializeDatabase() {
   const client = await pool.connect();
   try {
      await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
      );
    `);
      await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) REFERENCES users(username),
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        date DATE NOT NULL
      );
    `);
   } finally {
      client.release();
   }
}

// Function to add a new user
async function addUser(username, password) {
   const client = await pool.connect();
   try {
      const result = await client.query(
         'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
         [username, password]
      );
      return result.rows[0];
   } finally {
      client.release();
   }
}

// Function to find a user by username
async function findUser(username) {
   const client = await pool.connect();
   try {
      const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
   } finally {
      client.release();
   }
}

// Function to add a new expense
async function addExpense(username, amount, category, date) {
   const client = await pool.connect();
   try {
      await client.query(
         'INSERT INTO expenses (username, amount, category, date) VALUES ($1, $2, $3, $4)',
         [username, amount, category, date]
      );
   } finally {
      client.release();
   }
}

// Function to get all expenses for a user
async function getExpenses(username) {
   const client = await pool.connect();
   try {
      const result = await client.query('SELECT * FROM expenses WHERE username = $1', [username]);
      return result.rows;
   } finally {
      client.release();
   }
}

module.exports = { initializeDatabase, addUser, findUser, addExpense, getExpenses };
