import { db } from '../db/index.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getCourse, getEnrollment, getAllCourses, getProgress, getUser } from '../actions/user.actions.js';

const router = express.Router();

const SECRET = process.env.SECRET;

const loginInput = z.object({
    email: z.string().email(),
    password: z.string().min(4),
});

router.post('/login', async (req, res) => {
    try {
        const parsedInput = loginInput.safeParse(req.headers);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const user = await db.user.findUnique({
            where: {
                email: parsedInput.data.email
            }
        });

        if (!user || user.password !== parsedInput.data.password) {
            return res.status(403).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: parsedInput.data.email, role: user.role, id: user.id }, SECRET, { expiresIn: '4w' });
        return res.json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await getUser(req.user.email);
        res.json(user);
    } catch (error) {
        console.log("[ME]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await db.category.findMany();
        return res.json({ categories });
    } catch (error) {
        console.log("CATEGORIES");
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses', authenticateToken, async (req, res) => {
    try {
        const { title, categoryId } = req.query;
        const courses = await getAllCourses({
            userId: req.user.id,
            categoryId: categoryId || null,
            title: title || null
        });

        courses.map(course => {
            course.coverImage.data = course.coverImage.data.toString('base64');
        })

        return res.json({ courses });
    } catch (error) {
        console.log("BROWSE_ALL_COURSES", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await getCourse(courseId, req.user.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const enrollment = await getEnrollment(courseId, req.user.id);
        const progressPercentage = await getProgress(course.id, req.user.id);

        res.json({ course, enrollment, progressPercentage });
    } catch (error) {
        console.log("[USER -> COURSE]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;