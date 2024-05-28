import express from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { getInstructorOrAbove, createCourse, getCreatedCourses, getCourse, getUser, createModule, getModule, updateModule, getLastModule, deleteAttachment, getAttachment, getAttachments, createAttachment, updateCourse, createArticle, getLastArticle, getArticle, updateArticle, deleteArticle, publishArticle, unpublishArticle, publishCourse, unpublishCourse, deleteCourse } from '../actions/actions.js';
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

const reorderInput = z.object({
    list: z.object({
        id: z.string().length(36),
        position: z.number().int()
    }).array()
});

const articleUpdateInput = z.object({
    title: z.string().min(4).max(200).optional(),
    content: z.string().min(1).optional(),
    isFree: z.boolean().optional()
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

        if (course.coverImageId) {
            const coverImage = await getAttachment(course.id, course.coverImageId);
            course.coverImage = coverImage.data.toString('base64');
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
                const attachment = await createAttachment(req.file, course.id, true);
                updatedCourse = await updateCourse(course.id, { coverImageId: attachment.id });
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

        updatedCourse = await updateCourse(course.id, parsedInput.data);

        return res.json({ message: "Course updated successfully", course: updatedCourse })
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/courses/:courseId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), upload.single('file'), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const deletedCourse = await deleteCourse(course.id);
        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> DELETE]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/publish', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const publishedCourse = await publishCourse(course);
        if (!publishedCourse) {
            return res.status(400).json({ message: "All fields must be filled" });
        }

        return res.json({ message: "Course published successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> PUBLISH]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/unpublish', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const publishedCourse = await unpublishCourse(course.id);
        if (!publishedCourse) {
            return res.status(400).json({ message: "All fields must be filled" });
        }

        return res.json({ message: "Course published successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> UNPUBLISH]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/courses/:courseId/attachments', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), upload.single('file'), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachment = await createAttachment(req.file, course.id);
        attachment.data = attachment.data.toString('base64');
        return res.status(201).json({ attachment });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId/attachments', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId } = req.params;
        const { includeData } = req.query;

        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachments = await getAttachments(course.id, includeData === 'true');
        if (includeData === 'true') {
            attachments.map(attachment => {
                attachment.data = attachment.data.toString('base64');
            });
        }

        return res.status(200).json({ attachments });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId/attachments/:attachmentId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, attachmentId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachment = await getAttachment(courseId, attachmentId);

        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        attachment.data = attachment.data.toString('base64');

        return res.status(200).json({ attachment });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/courses/:courseId/attachments/:attachmentId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, attachmentId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const attachment = await deleteAttachment(courseId, attachmentId);

        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        return res.json({ message: "Attachment deleted successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> ATTACHMENTS]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/courses/:courseId/modules', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const parsedInput = titleInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const lastModule = await getLastModule(req.params.courseId);
        const newPosition = lastModule ? lastModule.position + 1 : 1;

        const module = await createModule(parsedInput.data.title, newPosition, course.id);
        if (module) {
            return res.status(201).json({ message: "Module created successfully", moduleId: module.id });
        }
        return res.status(500).json({ error: "Internal server error" });
    } catch (error) {
        console.error("[INSTRUCTOR -> COURSES -> MODULES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId/modules/:moduleId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(courseId, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        return res.json({ module });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> MODULES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/modules/:moduleId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const parsedInput = titleInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const module = await updateModule(moduleId, parsedInput.data);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        return res.json({ module });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> MODULES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/reorder', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const course = await getCourse(req.params.courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const parsedInput = reorderInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        for (const module of parsedInput.data.list) {
            await updateModule(module.id, {
                position: module.position
            });
        }

        return res.json({ message: "Reorder modules DONE" });
    } catch (error) {
        console.error("[INSTRUCTOR -> COURSES -> MODULES -> REORDER]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/courses/:courseId/modules/:moduleId/articles', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(course.id, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const parsedInput = titleInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const lastArticle = await getLastArticle(module.id);
        const newPosition = lastArticle ? lastArticle.position + 1 : 1;

        const article = await createArticle(parsedInput.data.title, newPosition, module.id);
        if (article) {
            return res.status(201).json({ message: "Article created successfully", articleId: article.id });
        }
        return res.status(500).json({ error: "Internal server error" });
    } catch (error) {
        console.error("[INSTRUCTOR -> COURSES -> MODULES -> ARTICLES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId/modules/:moduleId/articles/:articleId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId, articleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(course.id, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const article = await getArticle(module.id, articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        return res.json({ article });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> MODULES -> ARTICLES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/modules/:moduleId/reorder', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(course.id, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const parsedInput = reorderInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        for (const article of parsedInput.data.list) {
            await updateArticle(article.id, {
                position: article.position
            });
        }

        return res.json({ message: "Reorder articles DONE" });
    } catch (error) {
        console.error("[INSTRUCTOR -> COURSES -> MODULES -> ARTICLES -> REORDER]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/modules/:moduleId/articles/:articleId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId, articleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(course.id, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const parsedInput = articleUpdateInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const article = await updateArticle(articleId, parsedInput.data);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        return res.json({ article });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> MODULES -> ARTICLES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/courses/:courseId/modules/:moduleId/articles/:articleId', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId, articleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(course.id, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const article = await deleteArticle(module.id, articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        let unpublishCourse = true;
        for (const module of course.modules) {
            const results = await db.article.findMany({
                where: {
                    moduleId: module.id,
                    isPublished: true
                }
            });
            if (results.length > 0) {
                unpublishCourse = false;
                break;
            }
        }
        if (unpublishCourse) {
            await updateCourse(course.id, {
                isPublished: false
            });
        }

        return res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> MODULES -> ARTICLES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/modules/:moduleId/articles/:articleId/publish', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId, articleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(course.id, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const article = await getArticle(module.id, articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        const publishedArticle = await publishArticle(module.id, article);
        if (!publishedArticle) {
            return res.status(400).json({ message: "All fields must be filled" });
        }

        return res.json({ message: "Article published successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> MODULES -> ARTICLES -> PUBLISH]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/modules/:moduleId/articles/:articleId/unpublish', authenticateToken, authorizeRoles(SUPERADMIN, ADMIN, INSTRUCTOR), async (req, res) => {
    try {
        const { courseId, moduleId, articleId } = req.params;
        const course = await getCourse(courseId);
        if (!course || !isValidInstructorOrAbove(req.user, course.instructor.email)) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await getModule(course.id, moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const article = await unpublishArticle(module.id, articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        let unpublishCourse = true;
        for (const module of course.modules) {
            const results = await db.article.findMany({
                where: {
                    moduleId: module.id,
                    isPublished: true
                }
            });
            if (results.length > 0) {
                unpublishCourse = false;
                break;
            }
        }
        if (unpublishCourse) {
            await updateCourse(course.id, {
                isPublished: false
            });
        }

        return res.json({ message: "Article unpublished successfully" });
    } catch (error) {
        console.log("[INSTRUCTOR -> COURSES -> MODULES -> ARTICLES -> UNPUBLISH]", error);
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

export default router;