const mongoose = require("mongoose");
const express = require('express');
const Instructor = require("../db/Instructor");
const { Course, Module, Article } = require("../db/Course");
const jwt = require('jsonwebtoken');
const { authenticateInstructor } = require('../middleware/auth');
const { z } = require('zod')
require('dotenv').config;

const SECRET = process.env.SECRET;

const router = express.Router();

const signupInput = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(4),
})

const loginInput = z.object({
    email: z.string().email(),
    password: z.string().min(4),
})

const courseInput = z.object({
    title: z.string().min(4).max(200),
    description: z.string().min(4),
    price: z.number(),
    published: z.boolean(),
})

router.post('/signup', async (req, res) => {
    try {
        const parsedInput = signupInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            })
        }
        const instructor = await Instructor.findOne({ email: parsedInput.data.email });

        if (instructor) {
            res.status(403).json({ message: 'Instructor with same email already exists' });
        } else {
            await Instructor.create({
                email: parsedInput.data.email,
                password: parsedInput.data.password,
                firstName: parsedInput.data.firstName,
                lastName: parsedInput.data.lastName
            });
            const token = jwt.sign({ email: parsedInput.data.email, role: 'instructor' }, SECRET, { expiresIn: '1h' });
            res.status(201).json({ token });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
});

router.post('/login', async (req, res) => {
    try {
        const parsedInput = loginInput.safeParse(req.headers);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            })
        }
        const instructor = await Instructor.findOne({ email: parsedInput.data.email });

        if (!instructor) {
            res.status(403).json({ message: 'Invalid credentials' });
        } else {
            if (instructor.password !== parsedInput.data.password) {
                return res.status(403).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ email: parsedInput.data.email, role: 'instructor' }, SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
});

router.post('/courses', authenticateInstructor, async (req, res) => {
    const parsedInput = courseInput.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            message: parsedInput.error
        })
    }
    const instructor = await Instructor.findOne({ email: req.instructor.email });

    if (!instructor) {
        return res.status(401).json({ message: "Instructor not found" })
    }

    try {
        const course = await Course.create({
            title: parsedInput.data.title,
            description: parsedInput.data.description,
            price: parsedInput.data.price,
            published: parsedInput.data.published,
            instructor: instructor._id
        })
        instructor.createdCourses.push(course);
        await instructor.save();
        res.status(201).json({ message: "Course created successfully", courseId: course._id })
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

    await instructor.populate('createdCourses')
    res.json({ courses: instructor.createdCourses })
})

module.exports = router;