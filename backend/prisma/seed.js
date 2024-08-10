import { Role } from '@prisma/client';
import { db } from './index.js';
import bcrypt from "bcrypt";
import 'dotenv/config';

const main = async () => {
    try {
        const category = await db.category.createMany({
            data: [
                { name: "Computer Science" },
                { name: "Development" },
                { name: "Music" },
                { name: "Fitness" },
                { name: "Art" },
                { name: "Cooking" },
                { name: "Travel" },
                { name: "Photography" },
                { name: "Engineering" },
                { name: "Finance" }
            ]
        });

        if (category) {
            console.log("Categories Addition: Success");
        } else {
            console.log("Categories Addition: Fail");
        }
    } catch (error) {
        console.log(error);
    }

    try {
        const hashedPassword = bcrypt.hashSync(process.env.SUPERADMIN_PASSWORD, 10);
        const superadmin = await db.user.upsert({
            where: {
                email: process.env.SUPERADMIN_EMAIL,
                role: Role.SUPERADMIN
            },
            create: {
                email: process.env.SUPERADMIN_EMAIL,
                password: hashedPassword,
                role: Role.SUPERADMIN
            },
            update: {
                password: hashedPassword
            }
        });

        if (superadmin) {
            console.log("Superadmin Creation: Success");
        } else {
            console.log("Superadmin Creation: Fail");
        }
    } catch (error) {
        console.log(error);
    }
}

main();