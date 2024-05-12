const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    published: {
        type: Boolean,
        default: false,
    },
    isFree: {
        type: Boolean,
        default: false,
    },
    content: {
        type: String,
        required: false,
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
    categoryId: {
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
    attachments: [{
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
    }],
    purchases: [{
        type: Schema.Types.ObjectId,
        ref: 'Purchase'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const userProgressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    articleId: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
    },
    isCompleted: {
        type: Boolean,
        default: false,
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

const Article = model('Article', articleSchema);
const Module = model('Module', moduleSchema);
const Course = model('Course', courseSchema);
const UserProgress = model('UserProgress', userProgressSchema);

module.exports = { Course, Module, Article, UserProgress };
