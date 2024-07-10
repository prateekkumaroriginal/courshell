import express from "express";
import { ADMIN, INSTRUCTOR, SUPERADMIN, USER } from "../constants.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { z } from "zod";
import { db } from "../prisma/index.js";

const router = express.Router();

const addUserInput = z.object({
    email: z.string().email().min(4).max(200),
    password: z.string().min(8).max(64),
    role: z.enum([USER, INSTRUCTOR, ADMIN])
});

router.post("/users", authenticateToken, authorizeRoles(SUPERADMIN), async (req, res) => {
    try {
        const parsedInput = addUserInput.safeParse(req.body);
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

        const user = await db.user.create({
            data: {
                email: parsedInput.data.email,
                password: parsedInput.data.password,
                role: parsedInput.data.role
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        if (user) {
            return res.status(201).json({ user });
        }
        return res.status(500).json({ error: "Internal server error" });
    } catch (error) {
        console.error("[SUPERADMIN]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/users", authenticateToken, authorizeRoles(SUPERADMIN), async (req, res) => {
    try {
        const users = await db.user.findMany({
            where: {
                role: {
                    not: SUPERADMIN
                }
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return res.json({ users });
    } catch (error) {
        console.log("[SUPERADMIN]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/users/:userId", authenticateToken, authorizeRoles(SUPERADMIN), async (req, res) => {
    try {
        const deletedUser = await db.user.delete({
            where: {
                id: req.params.userId
            }
        });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("[SUPERADMIN]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;