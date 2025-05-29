const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://07206844:lesteremil003@lester17.kbov0.mongodb.net/?retryWrites=true&w=majority&appName=lester17',)
.then(() => {
  console.log('Connected to database!');
})
.catch((error) => {
  console.log('Connection failed!', error.message);
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

// Serve images statically
app.use("/images", express.static(path.join("backend/images")));

// Routes
app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

module.exports = app; 