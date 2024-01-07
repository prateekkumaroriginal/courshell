const mongoose = require("mongoose");
const express = require('express');
const Instructor = require("../db/Instructor");
const { Course, Module, Article } = require("../db/Course");
const jwt = require('jsonwebtoken');
const { authenticateInstructor } = require('../middleware/auth');
require('dotenv').config;

const SECRET = process.env.SECRET;

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const instructor = await Instructor.findOne({ email });

        if (instructor) {
            res.status(403).json({ message: 'Instructor with same email already exists' });
        } else {
            await Instructor.create({ email, password, firstName, lastName });
            const token = jwt.sign({ email, role: 'instructor' }, SECRET, { expiresIn: '1h' });
            res.status(201).json({ token });
        }
    } catch (error) {
        res.status(403).json({ error })
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.headers;
        const instructor = await Instructor.findOne({ email });

        if (!instructor) {
            res.status(403).json({ message: 'Invalid credentials' });
        } else {
            if (instructor.password !== password) {
                return res.status(403).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ email, role: 'instructor' }, SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        }
    } catch (error) {
        res.status(403).json({ error })
    }
});

router.post('/courses', authenticateInstructor, async (req, res) => {
    const { title, description, price, published } = req.body;
    const instructor = await Instructor.findOne({ email: req.instructor.email });

    if (!instructor) {
        return res.status(401).json({ message: "Instructor not found" })
    }

    try {
        const course = await Course.create({ title, description, price, published, instructor: instructor._id })
        res.status(201).json({ message: "Course created successfully", courseId: course._id })
        instructor.createdCourses.push(course);
        await instructor.save();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
})

router.get('/courses', authenticateInstructor, async (req, res) => {
    const instructor = await Instructor.findOne({ email: req.instructor.email });
    if (!instructor) {
        return res.status(401).json({ message: "Instructor not found" })
    }

    const courses = await instructor.populate('createdCourses')
    res.json({ courses: instructor.createdCourses })
})

module.exports = router;