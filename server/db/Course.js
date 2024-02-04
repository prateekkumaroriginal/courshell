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
    module: {
        type: Schema.Types.ObjectId,
        ref: 'Module',
    },
    position: {
        type: Number,
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


const moduleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article',
    }],
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
    },
    position: {
        type: Number,
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

const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: "",
    },
    imageId: {
        type: Schema.Types.ObjectId,
        required: false,
        default: null
    },
    price: {
        type: Number,
        required: false,
        default: null
    },
    modules: [{
        type: Schema.Types.ObjectId,
        ref: 'Module',
    }],
    published: {
        type: Boolean,
        required: true,
        default: false
    },
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
