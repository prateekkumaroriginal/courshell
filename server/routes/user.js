const mongoose = require("mongoose");
const express = require('express');
const User = require("../db/User");
const { Course, Module, Article } = require("../db/Course");
const jwt = require('jsonwebtoken');
const { authenticateJwt } = require("../middleware/auth");

const router = express.Router();

module.exports = router;