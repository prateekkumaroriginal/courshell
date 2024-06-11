import { db } from '../db/index.js';
import { z } from 'zod';
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ACCEPTED, ADMIN, PENDING, REJECTED, SUPERADMIN } from '../constants.js';

const router = express.Router();

router.get('/courses', authenticateToken, authorizeRoles(ADMIN, SUPERADMIN), async (req, res) => {
    try {
        const courses = await db.course.findMany({
            include: {
                instructor: true,
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
        console.error("[ADMIN -> COURSES]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;