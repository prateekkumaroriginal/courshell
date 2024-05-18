import express from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { getInstructorOrAbove, createCourse, getCreatedCourses } from '../actions/actions.js';
import 'dotenv/config';

const router = express.Router();

const courseTitleInput = z.object({
    title: z.string().min(4).max(200),
});

router.post('/courses', authenticateToken, authorizeRoles("SUPERADMIN", "ADMIN", "INSTRUCTOR"), async (req, res) => {
    try {
        const parsedInput = courseTitleInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            })
        }
        const instructor = await getInstructorOrAbove(req.user.email);
        const course = await createCourse(parsedInput.data.title, instructor.id);

        if (course) {
            res.status(201).json({ message: "Course created successfully", courseId: course.id })
        }
    } catch (error) {
        console.error("[INSTRUCTOR -> COURSES]", error);
        res.status(500).json({ error: "Internal server error" })
    }
});

router.get('/courses', authenticateToken, authorizeRoles("SUPERADMIN", "ADMIN", "INSTRUCTOR"), async (req, res) => {
    try {
        const instructor = await getInstructorOrAbove(req.user.email);
        const courses = getCreatedCourses(instructor.id);

        return res.json({ courses });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES]", error);
    }
});

export default router;