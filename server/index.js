const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const instructorRouter = require('./routes/instructor')
const userRouter = require('./routes/user')
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use("/instructor", instructorRouter)
app.use("/user", userRouter)

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