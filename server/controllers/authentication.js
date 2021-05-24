"use strict"

const jwt = require('jsonwebtoken'),
      User = require('../models/user'),
      Guest = require('../models/guest'),
      config = require('../config/main');

function generateToken(user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 7200
  });
}
