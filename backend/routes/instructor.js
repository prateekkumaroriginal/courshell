import express from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { getInstructorOrAbove, createCourse, getCreatedCourses, getCourse } from '../actions/actions.js';
import { SUPERADMIN, ADMIN, INSTRUCTOR, USER } from '../constants.js';
import 'dotenv/config';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const courseTitleInput = z.object({
    title: z.string().min(4).max(200),
});

const isValidInstructorOrAbove = (user, email) => {
    return user.role === SUPERADMIN || user.role === ADMIN || user.email === email;
}

router.post('/courses', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
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

router.get('/courses', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const instructor = await getInstructorOrAbove(req.user.email);
        const courses = await getCreatedCourses(instructor.id);

        return res.json({ courses });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES]", error);
    }
});

router.get('/courses/:courseId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.json({ course });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES]", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/courses/:courseId/attachments', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), upload.single('file'), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachment = await db.attachment.create({
            data: {
                name: req.file.originalname,
                data: req.file.buffer,
                type: req.file.mimetype,
                courseId: course.id,
            }
        });
        return res.status(201).json({ attachment });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId/attachments', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachments = await db.attachment.findMany({
            where: {
                courseId: course.id
            }
        });
        attachments.map(attachment => {
            attachment.data = attachment.data.toString('base64');
        });

        return res.status(201).json({ attachments });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId/attachments/:attachmentId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachment = await db.attachment.findUnique({
            where: {
                courseId: course.id,
                id: req.params.attachmentId,
            }
        });

        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        attachment.data = attachment.data.toString('base64');

        return res.status(201).json({ attachment });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/courses/:courseId/attachments/:attachmentId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachment = await db.attachment.delete({
            where: {
                courseId: course.id,
                id: req.params.attachmentId,
            }
        });

        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        return res.json({ message: "Attachment deleted successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;