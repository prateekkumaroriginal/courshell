import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import instructorRouter from './routes/instructor.js';
import userRouter from './routes/user.js';
import adminRouter from './routes/admin.js';
import superadminRouter from './routes/superadmin.js';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/instructor", instructorRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/superadmin", superadminRouter);

const port = process.env.PORT || 3000;

app.get('/health-check', (req, res) => {
    res.send("OK")
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});