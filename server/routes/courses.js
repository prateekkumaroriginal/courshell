const express = require('express');
const User = require("../db/User");
const { Course, Module, Article } = require("../db/Course");
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../middleware/auth');
const { z } = require('zod')
require('dotenv').config;

const router = express.Router();

router.get('/', async (req, res) => {
    const courses = await Course.find({ published: true })
    return res.json({ courses })
})

router.get('/:courseId', async (req, res) => {
    const course = await Course.findById(req.params.courseId)
    if (!course || !course.published) {
        return res.status(404).json({ error: "Course not found" })
    }
    res.json({ course })
})

router.get('/:courseId/modules', authenticateUser, async (req, res) => {
    const course = await Course.findOne({ published: true })
    if (!course || !course.published) {
        return res.status(404).json({ error: "Course not found" })
    }
    const user = await User.findOne({ email: req.user.email })
    if (!user) {
        return res.status(401).json({ error: "User not found" })
    }

    if (user.enrolledCourses.includes(course._id)) {
        const modules = course.modules;
        return res.json({ modules })
    }
    res.status(403).json({ message: "Course not enrolled" })
})

module.exports = router;