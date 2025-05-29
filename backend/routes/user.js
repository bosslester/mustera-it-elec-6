const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup route
router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const newUser = new User({
        email: req.body.email,
        password: hash
      });
      return newUser.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User created!',
        result: result
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Invalid Authentication Credentials!"
      });
    });
});

// Login route
router.post('/login', (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Invalid Authentication Credentials!"
        });
      }
      return bcrypt.compare(req.body.password, user.password)
        .then(result => {
          if (!result) {
            return res.status(401).json({
              message: "Invalid Authentication Credentials!"
            });
          }
          const token = jwt.sign(
            { email: user.email, userId: user._id },
            'a_very_long_secret_key_for_our_mean_stack_app',
            { expiresIn: '1h' }
          );
          return res.status(200).json({
            token: token,
            expiresIn: 3600,
            userId: user._id
          });
        });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid Authentication Credentials!"
      });
    });
});

module.exports = router; 