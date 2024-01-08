const mongoose = require("mongoose");
const express = require('express');
const User = require("../db/User");
const { Course, Module, Article } = require("../db/Course");
const jwt = require('jsonwebtoken');
const { authenticateJwt } = require("../middleware/auth");
const { z } = require('zod');
require('dotenv').config();

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

router.post('/signup', async (req, res) => {
    try {
        const parsedInput = signupInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            })
        }
        const user = await User.findOne({ email: parsedInput.data.email });

        if (user) {
            res.status(403).json({ message: 'User with same email already exists' });
        } else {
            await User.create({
                email: parsedInput.data.email,
                password: parsedInput.data.password,
                firstName: parsedInput.data.firstName,
                lastName: parsedInput.data.lastName
            });
            const token = jwt.sign({ email: parsedInput.data.email, role: 'user' }, SECRET, { expiresIn: '1h' });
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
        const user = await User.findOne({ email: parsedInput.data.email });

        if (!user) {
            res.status(403).json({ message: 'Invalid credentials' });
        } else {
            if (user.password !== parsedInput.data.password) {
                return res.status(403).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ email: parsedInput.data.email, role: 'user' }, SECRET, { expiresIn: '1h' });
            res.json({ token });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
});

module.exports = router;