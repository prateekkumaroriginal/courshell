const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
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
    enrolledCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const UserX = model('User', userSchema);

module.exports = UserX;
