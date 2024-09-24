import express from "express";
import { ADMIN, INSTRUCTOR, SUPERADMIN, USER } from "../constants.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { db } from "../prisma/index.js";

const router = express.Router();

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