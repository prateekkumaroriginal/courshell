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
    const course = await Course.findOne({ _id: req.params.courseId, published: true })
    if (!course || !course.published) {
        return res.status(404).json({ error: "Course not found" })
    }
    const user = await User.findOne({ email: req.user.email })
    if (!user) {
        return res.status(401).json({ error: "User not found" })
    }

    if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ message: "Course not enrolled" })
    }
    const modules = course.modules;
    return res.json({ modules })
})

router.get('/:courseId/modules/:moduleId/articles', authenticateUser, async (req, res) => {
    const course = await Course.findOne({ _id: req.params.courseId, published: true })
    if (!course || !course.published) {
        return res.status(404).json({ error: "Course not found" })
    }
    const user = await User.findOne({ email: req.user.email })
    if (!user) {
        return res.status(401).json({ error: "User not found" })
    }
    const module = await Module.findById(req.params.moduleId)
    if (!module) {
        return res.status(404).json({ error: "Module not found" })
    }

    if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ message: "Course not enrolled" })
    }
    const articles = module.articles;
    return res.json({ articles })
})

module.exports = router;