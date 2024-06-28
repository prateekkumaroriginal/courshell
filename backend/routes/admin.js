import { db } from '../prisma/index.js';
import { z } from 'zod';
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ACCEPTED, ADMIN, PENDING, REJECTED, SUPERADMIN } from '../constants.js';
import { getProgress } from '../actions/user.actions.js';

const router = express.Router();

const requestUpdateInput = z.object({
    status: z.enum([ACCEPTED, REJECTED, PENDING])
});

router.get('/courses', authenticateToken, authorizeRoles(ADMIN, SUPERADMIN), async (req, res) => {
    try {
        const courses = await db.course.findMany({
            include: {
                instructor: {
                    select: {
                        id: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        requestedUsers: true,
                        enrolledUsers: true
                    }
                }
            }
        });
        return res.json({ courses });
    } catch (error) {
        console.log("[ADMIN -> COURSES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/courses/:courseId', authenticateToken, authorizeRoles(ADMIN, SUPERADMIN), async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await db.course.findUnique({
            where: {
                id: courseId
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        email: true
                    }
                },
                enrolledUsers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true
                            }
                        }
                    }
                },
                requestedUsers: {
                    orderBy: {
                        updatedAt: "desc"
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.enrolledUsers = await Promise.all(
            course.enrolledUsers.map(async (enrollment) => {
                const progress = await getProgress(courseId, enrollment.user.id);
                return {
                    ...enrollment,
                    progress
                };
            })
        );

        const userRequestMap = new Map();

        course.requestedUsers.forEach(request => {
            if (!userRequestMap.has(request.userId)) {
                userRequestMap.set(request.userId, request);
            }
        });
        course.requestedUsers = Array.from(userRequestMap.values());

        return res.json({ course });
    } catch (error) {
        console.log("[ADMIN -> COURSES -> COURSE]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/courses/:courseId/requests/:requestId', authenticateToken, authorizeRoles(ADMIN, SUPERADMIN), async (req, res) => {
    try {
        const { courseId, requestId } = req.params;
        const course = await db.course.findUnique({
            where: {
                id: courseId
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const parsedInput = requestUpdateInput.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                message: parsedInput.error
            });
        }

        const status = parsedInput.data.status;
        const request = await db.request.update({
            where: {
                id: requestId
            },
            data: {
                status
            }
        });

        let enrollment;
        if (request && request.status === ACCEPTED) {
            enrollment = await db.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: request.userId,
                        courseId
                    }
                }
            });

            if (!enrollment) {
                enrollment = await db.enrollment.create({
                    data: {
                        userId: request.userId,
                        courseId
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true
                            }
                        }
                    }
                });
                if (enrollment) {
                    enrollment.progress = 0;
                }
            }
        }

        return res.json({ message: "Request updated", enrollment });
    } catch (error) {
        console.log("[ADMIN -> COURSES -> COURSE -> REQUEST]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;