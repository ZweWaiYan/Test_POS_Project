const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Example API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../build')));

// Serve React app for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
