import express from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { getInstructorOrAbove, createCourse, getCreatedCourses, getCourse, getUser, createModule } from '../actions/actions.js';
import { SUPERADMIN, ADMIN, INSTRUCTOR, USER } from '../constants.js';
import 'dotenv/config';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const titleInput = z.object({
    title: z.string().min(4).max(200),
});

const courseUpdateInput = z.object({
    title: z.string().min(4).max(200).optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    categoryId: z.string().min(1).optional(),
});

const isValidInstructorOrAbove = (user, email) => {
    return user.role === SUPERADMIN || user.role === ADMIN || user.email === email;
}

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await getUser(req.user.email);
        res.json(user);
    } catch (error) {
        console.log("[ME]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/courses', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const parsedInput = titleInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            })
        }
        const instructor = await getInstructorOrAbove(req.user.email);
        const course = await createCourse(parsedInput.data.title, instructor.id);

        if (course) {
            return res.status(201).json({ message: "Course created successfully", courseId: course.id });
        }
        return res.status(500).json({ error: "Internal server error" });
    } catch (error) {
        console.error("[INSTRUCTOR -> COURSES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const instructor = await getInstructorOrAbove(req.user.email);
        const courses = await getCreatedCourses(instructor.id);

        return res.json({ courses });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES]", error);
        return res.status(500).json({ error: "Internal server error" });
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
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), upload.single('file'), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        let updatedCourse;
        if (req.file) {
            if (req.file.mimetype.startsWith('image/')) {
                const attachment = await db.attachment.create({
                    data: {
                        isCoverImage: true,
                        name: req.file.originalname,
                        data: req.file.buffer,
                        type: req.file.mimetype,
                        courseId: course.id,
                    }
                });

                updatedCourse = await db.course.update({
                    where: {
                        id: course.id
                    },
                    data: {
                        coverImageId: attachment.id
                    }
                });
            } else {
                return res.status(400).json({ message: "Uploaded file was not an image" });
            }
        }

        const parsedInput = courseUpdateInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        updatedCourse = await db.course.update({
            where: {
                id: course.id
            },
            data: parsedInput.data
        });

        return res.json({ message: "Course updated successfully", course: updatedCourse })
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES]", error);
        return res.status(500).json({ error: "Internal server error" });
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

router.post('/courses/:coursedId/modules', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.coursedId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const parsedInput = titleInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const module = await createModule(parsedInput.data.title);
        if (module) {
            return res.status(201).json({ message: "Module created successfully", moduleId: module.id });
        }
        return res.status(500).json({ error: "Internal server error" });
    } catch (error) {
        console.error("[INSTRUCTOR -> COURSES -> MODULES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/categories', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const categories = await db.category.findMany();
        return res.json({ categories });
    } catch (error) {
        console.log("INSTRUCTOR -> CATEGORIES");
        return res.status(500).json({ error: "Internal server error" });
    }
})

export default router;