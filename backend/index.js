import express from 'express';
import bodyParser from 'body-parser';
import { db } from './db/index.js';
import cors from 'cors';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import instructorRouter from './routes/instructor.js';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/instructor", instructorRouter);
// app.use("/user", userRouter);

const port = process.env.PORT || 3000;
const SECRET = process.env.SECRET;

const loginInput = z.object({
    email: z.string().email(),
    password: z.string().min(4),
});

app.post('/login', async (req, res) => {
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
        console.log(user);

        if (!user || user.password !== parsedInput.data.password) {
            return res.status(403).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: parsedInput.data.email, role: user.role }, SECRET, { expiresIn: '4w' });
        return res.json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// Changed here