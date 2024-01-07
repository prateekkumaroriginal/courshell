const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const instructorSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Instructor = model('Instructor', instructorSchema);

module.exports = Instructor;
