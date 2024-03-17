const express = require('express');
const Instructor = require("../db/Instructor");
const Category = require("../db/Category");
const { Course, Module, Article } = require("../db/Course");
const Attachment = require("../db/Attachment");
const jwt = require('jsonwebtoken');
const { authenticateInstructor } = require('../middleware/auth');
const { z } = require('zod')
const uploadImage = require('../middleware/uploadImage');
const uploadFiles = require('../middleware/uploadFiles');
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

const courseTitleInput = z.object({
    title: z.string().min(4).max(200),
})

const courseUpdateInput = z.object({
    title: z.string().min(4).max(200).optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    categoryId: z.string().min(1).optional()
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
            const token = jwt.sign({ email: parsedInput.data.email, role: 'instructor' }, SECRET, { expiresIn: '1w' });
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
            const token = jwt.sign({ email: parsedInput.data.email, role: 'instructor' }, SECRET, { expiresIn: '1w' });
            res.json({ token });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
});

router.post('/courses', authenticateInstructor, async (req, res) => {
    const parsedInput = courseTitleInput.safeParse(req.body);
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

router.get('/courses/:courseId', authenticateInstructor, async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const instructor = await Instructor.findOne({ email: req.instructor.email });
    if (course.instructor.toString() !== instructor._id.toString()) {
        return res.status(404).json({ message: "Course with this instructor not found" });
    }

    return res.json({ course })
})

router.get('/courses/:courseId/attachments', authenticateInstructor, async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const instructor = await Instructor.findOne({ email: req.instructor.email });
    if (course.instructor.toString() !== instructor._id.toString()) {
        return res.status(404).json({ message: "Course with this instructor not found" });
    }

    await course.populate('attachments');
    const files = [];
    for (const attachment of course.attachments) {
        const response = await fetch(`http://localhost:3000/files/${attachment.fileId}`)
        files.push({
            id: attachment._id,
            url: response.url,
            name: attachment.name
        })
    }
    res.json({ attachments: files })
})

router.post('/courses/:courseId/attachments', authenticateInstructor, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const instructor = await Instructor.findOne({ email: req.instructor.email });
        if (course.instructor.toString() !== instructor._id.toString()) {
            return res.status(403).json({ message: "Course with this instructor not found" });
        }


        uploadFiles.array('files', 5)(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ message: 'Error uploading files' });
            }

            if (req.files.some(file => file.size > (5 * 1024 * 1024))) {
                return res.status(400).json({ message: 'File size exceeds the limit' });
            }

            const files = req.files;
            const attachments = [];
            for (const file of files) {
                const attachment = await Attachment.create({
                    name: file.originalname,
                    fileId: file.id,
                    courseId,
                });
                attachments.push({
                    id: attachment._id,
                    url: `http://localhost:3000/files/${attachment.fileId}`,
                    name: attachment.name
                });
                course.attachments.push(attachment);
            }
            course.save();
            res.status(200).json({
                message: 'Files uploaded successfully',
                attachments
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/courses/:courseId/attachments/:attachmentId', authenticateInstructor, async (req, res) => {
    const { courseId, attachmentId } = req.params;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const instructor = await Instructor.findOne({ email: req.instructor.email });
        if (course.instructor.toString() !== instructor._id.toString()) {
            return res.status(403).json({ message: "Course with this instructor not found" });
        }

        const deletedAttachment = await Attachment.findByIdAndDelete({
            _id: attachmentId,
            courseId: courseId
        });
        if (!deletedAttachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        const response = await fetch(`http://localhost:3000/files/${deletedAttachment.fileId}`, {
            method: 'DELETE',
            headers: {
                authorization: `Bearer ${req.token}`
            }
        });
        if (response.ok) {
            course.attachments = course.attachments.filter(id => id != attachmentId)
            course.save()
            res.status(200).json({ message: "Attachment deleted successfully" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
            console.log(await response.json());
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.patch('/courses/:courseId', authenticateInstructor, uploadImage.single('file'), async (req, res) => {
    let imageId;
    if (req.file) {
        imageId = req.file.id
    }

    const parsedInput = courseUpdateInput.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            message: parsedInput.error
        })
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const instructor = await Instructor.findOne({ email: req.instructor.email });
    if (course.instructor.toString() !== instructor._id.toString()) {
        return res.status(403).json({ message: "Course with this instructor not found" });
    }

    try {
        Object.assign(course, parsedInput.data);
        if (imageId) {
            Object.assign(course, { imageId });
        }
        if (parsedInput.data.categoryId) {
            const category = await Category.findById(parsedInput.data.categoryId)
            if (!category.courses.includes(course._id)) {
                category.courses.push(course)
                category.save()
            }
        }
        const updatedCourse = await course.save();
        return res.json({ course: updatedCourse });
    } catch (error) {
        console.error("Error updating course: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/me', authenticateInstructor, async (req, res) => {
    const instructor = await Instructor.findOne({ email: req.instructor.email })
    if (!instructor) {
        return res.status(401).json({ message: "Instructor not found" })
    }

    await instructor.populate('createdCourses');
    res.json({
        email: instructor.email,
        role: 'instructor',
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

    const parsedInput = moduleInput.safeParse(req.body)

    if (!parsedInput.success) {
        return res.status(400).json({
            message: parsedInput.error
        })
    }

    const lastModule = await Module.findOne({ course: req.params.courseId }).sort({ position: -1 }).limit(1);

    const newPosition = lastModule ? lastModule.position + 1 : 1;

    try {
        const module = await Module.create({
            title: parsedInput.data.title,
            course: course._id,
            position: newPosition,
        })
        if (module) {
            course.modules.push(module._id)
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

    const parsedInput = articleInput.safeParse(req.body)

    if (!parsedInput.success) {
        return res.status(400).json({
            message: parsedInput.error
        })
    }

    const lastArticle = await Article.findOne({ module: req.params.moduleId }).sort({ position: -1 }).limit(1);

    const newPosition = lastArticle ? lastArticle.position + 1 : 1;

    try {
        const article = await Article.create({
            title: parsedInput.data.title,
            content: parsedInput.data.content,
            module: module._id,
            position: newPosition,
        })
        if (article) {
            module.articles.push(article._id)
            await module.save()
            res.status(201).json({ message: "Article created successfully", moduleId: article._id })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;