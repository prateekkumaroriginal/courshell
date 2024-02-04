const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const instructorRouter = require('./routes/instructor')
const userRouter = require('./routes/user')
const courseRouter = require('./routes/courses')
const filesRouter = require('./routes/files')
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/instructor", instructorRouter);
app.use("/user", userRouter);
app.use("/courses", courseRouter);
app.use("/files", filesRouter);

const port = process.env.PORT || 3000;
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;

mongoose.connect(MONGODB_CONNECTION_STRING, { dbName: "Courses" }).then((res) => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.log(err);
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})