const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});


const moduleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article',
    }],
});

const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    modules: [{
        type: Schema.Types.ObjectId,
        ref: 'Module'
    }],
    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'Instructor',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Article = mongoose.model('Article', articleSchema);
const Module = model('Module', moduleSchema);
const Course = model('Course', courseSchema);

module.exports = { Course, Module, Article };
