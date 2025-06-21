import { db } from '../prisma/index.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import express from 'express';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth.js';
import bcrypt from "bcrypt";
import { getCourse, getEnrollment, getAllCourses, getProgress, getUser, getArticle, getArticleProgress } from '../actions/user.actions.js';
import { Role, STATUS } from '@prisma/client';
import { paymentService } from '../lib/payment-service.js';

const router = express.Router();

const SECRET = process.env.SECRET;

const BUSINESS_TYPES = [
    "llp",
    "ngo",
    "other",
    "individual",
    "partnership",
    "proprietorship",
    "public_limited",
    "private_limited",
    "trust",
    "society",
    "not_yet_registered",
    "educational_institutes"
];

const loginInput = z.object({
    email: z.string().email(),
    password: z.string().min(4).max(64),
});

const signupInput = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(64),
    password: z.string().min(8).max(64),
    role: z.enum([Role.USER, Role.INSTRUCTOR]),
    legal_business_name: z.string().min(4, "Legal business name must be at least 4 characters").max(200).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Phone number must be a 10-digit Indian number starting with 6-9 (e.g., 9876543210)").optional(),
    address: z.object({
        street1: z.string().min(1, "Street Line 1 is required").max(100, "Street Line 1 cannot exceed 100 characters"),
        street2: z.string().min(1, "Street Line 2 is required").max(100, "Street Line 2 cannot exceed 100 characters"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        postal_code: z.string().min(1, "Zip code is required"),
    }).optional(),
    business_type: z.enum(BUSINESS_TYPES).optional(),
    razorpayPayload: z.object({
        // bankAccount: z.object({
        //     accountNumber: z.string().min(1, "Account number is required"),
        //     ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
        //     beneficiaryName: z.string().min(1, "Beneficiary name is required"),
        // }),
        kyc: z.object({
            pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
            gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format").optional().nullable(),
        }),
    }).optional()
}).refine(
    ({ role, phone, address, business_type, legal_business_name, razorpayPayload }) => {
        if (role === Role.INSTRUCTOR) {
            return !!phone && !!address && !!business_type && !!legal_business_name && !!razorpayPayload?.kyc.pan;
        }
        return true;
    },
    {
        message: "Phone, address, business type, legal business name, and PAN are required for instructors",
        path: ["phone", "address", "business_type", "legal_business_name", "razorpayPayload"],
    }
);

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

        const {
            email,
            name,
            password,
            role,
            phone,
            address,
            legal_business_name,
            business_type,
            razorpayPayload
        } = parsedInput.data;

        const existingUser = await db.user.findUnique({
            where: {
                email
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

        let razorpayAccountId;
        if (role === Role.INSTRUCTOR) {
            try {
                const linkedAccount = await paymentService.razorpay.accounts.create({
                    email,
                    phone: `+91${phone}`,
                    contact_name: name,
                    legal_business_name,
                    business_type,
                    type: "route",
                    profile: {
                        category: process.env.BUSINESS_CATEGORY,
                        subcategory: process.env.BUSINESS_SUB_CATEGORY,
                        addresses: {
                            registered: {
                                street1: address.street1,
                                street2: address.street2,
                                city: address.city,
                                state: address.state,
                                postal_code: address.postal_code,
                                country: "IN",
                            },
                        },
                    },
                    legal_info: {
                        pan: razorpayPayload.kyc.pan,
                        ...(razorpayPayload.kyc.gst && {gst: razorpayPayload.kyc.gst}),
                    },
                    // bank_account: {
                    //     name: razorpayPayload.bankAccount.beneficiaryName,
                    //     account_number: razorpayPayload.bankAccount.accountNumber,
                    //     ifsc: razorpayPayload.bankAccount.ifscCode,
                    // },
                });

                razorpayAccountId = linkedAccount.id;
                console.log(linkedAccount);
            } catch (error) {
                console.error("[SIGNUP -> RAZORPAY]", error);
                return res.status(400).json({
                    message: {
                        issues: [{
                            message: error.error?.description || "Failed to create Razorpay Linked Account",
                        }],
                    },
                });
            }
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                ...(role === Role.INSTRUCTOR && {
                    phone,
                    address,
                    legal_business_name,
                    businessType: business_type,
                    razorpayAccountId
                })
            },
            select: {
                id: true,
                email: true,
                role: true,
                name: true
            }
        });

        const token = jwt.sign({ email, role: user.role, id: user.id }, SECRET, { expiresIn: '4w' });

        return res.json({
            token,
            role: user.role,
            email: parsedInput.data.email
        });
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

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.enrolledCourses = await Promise.all(
            user.enrolledCourses
                .filter(({ course }) => course.isPublished)
                .map(async ({ course }) => {
                    const { enrolledUsers, ...courseWithoutEnrolledUsers } = course;

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
                    where: {
                        articles: {
                            some: {
                                isPublished: true
                            }
                        }
                    },
                    orderBy: {
                        position: 'asc'
                    },
                    select: {
                        id: true,
                        title: true,
                        articles: {
                            where: {
                                isPublished: true
                            },
                            orderBy: {
                                position: 'asc'
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
                        },
                        articles: {
                            some: {
                                isPublished: true
                            }
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