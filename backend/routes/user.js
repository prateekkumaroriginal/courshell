import { db } from '../prisma/index.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import express from 'express';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth.js';
import bcrypt from "bcrypt";
import { getCourse, getEnrollment, getAllCourses, getProgress, getUser, getArticle, getArticleProgress } from '../actions/user.actions.js';
import { Role, STATUS } from '@prisma/client';

const router = express.Router();

const SECRET = process.env.SECRET;

const loginInput = z.object({
    email: z.string().email(),
    password: z.string().min(4).max(64),
});

const signupInput = z.object({
    email: z.string().email().min(4).max(200),
    password: z.string().min(8).max(64),
    role: z.enum([Role.USER, Role.INSTRUCTOR])
});

const markAsCompleteInput = z.object({
    isCompleted: z.boolean()
});

router.post("/signup", async (req, res) => {
    try {
        const parsedInput = signupInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const existingUser = await db.user.findUnique({
            where: {
                email: parsedInput.data.email
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: {
                    issues: [{
                        message: "User with same email already exists!"
                    }]
                }
            });
        }

        const hashedPassword = bcrypt.hashSync(parsedInput.data.password, 10);

        const user = await db.user.create({
            data: {
                email: parsedInput.data.email,
                password: hashedPassword,
                role: parsedInput.data.role
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        if (user) {
            const token = jwt.sign({ email: parsedInput.data.email, role: user.role, id: user.id }, SECRET, { expiresIn: '4w' });
            return res.json({
                token,
                role: user.role,
                email: parsedInput.data.email
            });
        }
    } catch (error) {
        console.error("[USER]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
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

        if (!user || !bcrypt.compareSync(parsedInput.data.password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: parsedInput.data.email, role: user.role, id: user.id }, SECRET, { expiresIn: '4w' });
        return res.json({
            token,
            role: user.role,
            email: parsedInput.data.email
        });
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

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = await db.user.findUnique({
            where: {
                email: req.user.email
            },
            select: {
                id: true,
                email: true,
                role: true,
                enrolledCourses: {
                    select: {
                        course: {
                            include: {
                                coverImage: true,
                                category: true,
                                enrolledUsers: {
                                    where: {
                                        userId: req.user.id
                                    }
                                },
                                modules: {
                                    include: {
                                        articles: {
                                            where: {
                                                isPublished: true
                                            },
                                            select: {
                                                id: true
                                            }
                                        }
                                    }
                                },
                            }
                        }
                    }
                },
                requestedCourses: {
                    select: {
                        updatedAt: true,
                        course: {
                            include: {
                                coverImage: true,
                                category: true,
                                enrolledUsers: {
                                    where: {
                                        userId: req.user.id
                                    }
                                },
                                modules: {
                                    include: {
                                        articles: {
                                            where: {
                                                isPublished: true
                                            },
                                            select: {
                                                id: true
                                            }
                                        }
                                    }
                                },
                            },
                        }
                    }
                },
            }
        });

        user.enrolledCourses = await Promise.all(
            user.enrolledCourses
                .filter(({ course }) => course.isPublished)
                .map(async ({ course }) => {
                    const { enrolledUsers, ...courseWithoutEnrolledUsers } = course;
                    course.coverImage.data = course.coverImage.data.toString('base64');

                    const progressPercentage = await getProgress(courseWithoutEnrolledUsers.id, req.user.id);
                    return {
                        ...courseWithoutEnrolledUsers,
                        progress: progressPercentage
                    }
                })
        );

        const latestRequestedCoursesMap = {};
        user.requestedCourses.forEach(request => {
            if (request.status === STATUS.PENDING) {
                const courseId = request.courseId;
                if (!latestRequestedCoursesMap[courseId] || new Date(request.updatedAt) > new Date(latestRequestedCoursesMap[courseId].updatedAt)) {
                    latestRequestedCoursesMap[courseId] = request;
                }
            }
        });
        user.requestedCourses = Object.values(latestRequestedCoursesMap);

        user.requestedCourses = await Promise.all(
            user.requestedCourses
                .filter(({ course }) => course.isPublished)
                .map(async ({ course }) => {
                    const { enrolledUsers, ...courseWithoutEnrolledUsers } = course;
                    course.coverImage.data = course.coverImage.data.toString('base64');

                    return {
                        ...courseWithoutEnrolledUsers
                    }
                })
        );

        res.json({ user });
    } catch (error) {
        console.log("[DASHBOARD]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await db.category.findMany();
        return res.json({ categories });
    } catch (error) {
        console.log("CATEGORIES");
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses', async (req, res) => {
    try {
        const { title, categoryId } = req.query;
        const courses = await getAllCourses(req.user ? req.user.id : null, categoryId || null, title || null);

        courses.map(course => {
            course.coverImage.data = course.coverImage.data.toString('base64');
        });

        return res.json({ courses });
    } catch (error) {
        console.log("BROWSE_ALL_COURSES", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId', optionalAuthenticate, async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await getCourse(courseId, req.user ? req.user.id : null);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (req.user) {
            const enrollment = await getEnrollment(courseId, req.user.id);
            const progressPercentage = await getProgress(course.id, req.user.id);
            return res.json({ course, enrollment, progressPercentage });
        }

        return res.json({ course });
    } catch (error) {
        console.log("[USER -> COURSE]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId/modules/:moduleId/articles/:articleId', authenticateToken, async (req, res) => {
    try {
        const { courseId, moduleId, articleId } = req.params;
        const course = await db.course.findUnique({
            where: {
                id: courseId,
                isPublished: true
            },
            include: {
                modules: {
                    include: {
                        articles: {
                            where: {
                                isPublished: true
                            },
                            include: {
                                userProgress: {
                                    where: {
                                        userId: req.user.id
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const enrollment = await getEnrollment(courseId, req.user.id);

        const article = await getArticle(articleId);
        let nextArticle;
        let nextModule;

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        if (article.isFree || enrollment) {
            nextArticle = await db.article.findFirst({
                where: {
                    isPublished: true,
                    moduleId,
                    position: {
                        gt: article?.position
                    }
                },
                orderBy: {
                    position: 'asc'
                },
                select: {
                    id: true
                }
            });

            if (!nextArticle) {
                const module = await db.module.findUnique({
                    where: {
                        id: moduleId
                    },
                    select: {
                        position: true
                    }
                });

                nextModule = await db.module.findFirst({
                    where: {
                        courseId,
                        position: {
                            gt: module?.position
                        }
                    },
                    orderBy: {
                        position: 'asc'
                    },
                    select: {
                        id: true
                    }
                });

                if (nextModule) {
                    nextArticle = await db.article.findFirst({
                        where: {
                            moduleId: nextModule.id,
                            isPublished: true
                        },
                        orderBy: {
                            position: 'asc'
                        },
                        select: {
                            id: true
                        }
                    });
                }
            }
        }

        const [userProgress, progressPercentage] = await Promise.all([
            getArticleProgress(articleId, req.user.id),
            getProgress(course.id, req.user.id)
        ]);

        return res.json({
            article,
            course,
            nextArticle,
            nextModule,
            userProgress,
            enrollment,
            progressPercentage
        });
    }
    catch (error) {
        console.log("[USER -> COURSE]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/articles/:articleId', authenticateToken, async (req, res) => {
    try {
        const { courseId, articleId } = req.params;
        const course = await db.course.findUnique({
            where: {
                id: courseId,
                isPublished: true
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const article = await getArticle(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        const parsedInput = markAsCompleteInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const userProgress = await db.userProgress.upsert({
            where: {
                userId_articleId: {
                    userId: req.user.id,
                    articleId
                }
            },
            update: parsedInput.data,
            create: {
                userId: req.user.id,
                articleId,
                ...parsedInput.data
            }
        });

        const progressPercentage = await getProgress(courseId, req.user.id);

        return res.json({ userProgress, progressPercentage });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/courses/:courseId/request', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await db.course.findUnique({
            where: {
                id: courseId,
                isPublished: true
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const enrollment = await getEnrollment(courseId, req.user.id);
        if (enrollment) {
            return res.status(400).json({ message: "Already Enrolled" });
        }

        const request = await db.request.findFirst({
            where: {
                userId: req.user.id,
                courseId
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        if (request && request.status === STATUS.PENDING) {
            return res.status(400).json({ message: "Previous request is pending" });
        }

        const newRequest = await db.request.create({
            data: {
                userId: req.user.id,
                courseId
            }
        });

        if (newRequest) {
            return res.json({ message: "Request for enrollment made" });
        }

        return res.json({ request });
    }
    catch (error) {
        console.log("[USER -> COURSE -> REQUEST]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;