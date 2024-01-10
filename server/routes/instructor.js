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

const moduleInput = z.object({
    title: z.string().min(4).max(200),
})

const articleInput = z.object({
    title: z.string().min(4).max(200),
    content: z.string().min(4),
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
            res.json({ token });
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
        if (course) {
            instructor.createdCourses.push(course);
            await instructor.save();
            res.status(201).json({ message: "Course created successfully", courseId: course._id })
        }
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

router.get('/me', authenticateInstructor, async (req, res) => {
    const instructor = await Instructor.findOne({ email: req.instructor.email })
    if (!instructor) {
        return res.status(401).json({ message: "Instructor not found" })
    }

    await instructor.populate('createdCourses');
    res.json({
        email: instructor.email,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        createdCourses: instructor.createdCourses,
    })
})

router.post('/courses/:courseId/modules', authenticateInstructor, async (req, res) => {
    const course = await Course.findById(req.params.courseId)
    if (!course) {
        return res.status(404).json({ message: "Course not found" })
    }

    const sequenceNumber = course.modules.length + 1;
    const parsedInput = moduleInput.safeParse(req.body)

    if (!parsedInput.success) {
        return res.status(400).json({
            message: parsedInput.error
        })
    }

    try {
        const module = await Module.create({
            title: parsedInput.data.title
        })
        if (module) {
            course.modules.push({
                module: module._id,
                sequence: sequenceNumber
            })
            await course.save()
            res.status(201).json({ message: "Module created successfully", moduleId: module._id })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post('/courses/:courseId/modules/:moduleId/articles', authenticateInstructor, async (req, res) => {
    const course = await Course.findById(req.params.courseId)
    if (!course) {
        return res.status(404).json({ message: "Course not found" })
    }

    const module = await Module.findById(req.params.moduleId)
    if (!module) {
        return res.status(404).json({ message: "Module not found" })
    }

    const sequenceNumber = module.articles.length + 1;
    const parsedInput = articleInput.safeParse(req.body)

    if (!parsedInput.success) {
        return res.status(400).json({
            message: parsedInput.error
        })
    }

    try {
        const article = await Article.create({
            title: parsedInput.data.title,
            content: parsedInput.data.content
        })
        if (article) {
            module.articles.push({
                article: article._id,
                sequence: sequenceNumber
            })
            await module.save()
            res.status(201).json({ message: "Article created successfully", moduleId: article._id })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;