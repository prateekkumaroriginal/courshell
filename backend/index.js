import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import instructorRouter from './routes/instructor.js';
import rootRouter from './routes/root.js';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/instructor", instructorRouter);
app.use("", rootRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});