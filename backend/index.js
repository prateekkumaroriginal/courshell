import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import instructorRouter from './routes/instructor.js';
import userRouter from './routes/user.js';
import adminRouter from './routes/admin.js';
import superadminRouter from './routes/superadmin.js';
import paymentRouter from './routes/payment.js';
import uploadthingRouter from './routes/uploadthing.js'
import 'dotenv/config';

const app = express();
app.use(cors());

app.use("/api/payment", paymentRouter);

app.use(bodyParser.json());

app.use("/api/instructor", instructorRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/superadmin", superadminRouter);
app.use("/api/uploadthing", uploadthingRouter);

const port = process.env.PORT || 3000;

app.get('/health-check', (req, res) => {
    res.send("OK")
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});