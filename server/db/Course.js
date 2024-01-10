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
        article: {
            type: Schema.Types.ObjectId,
            ref: 'Article',
        },
        sequence: {
            type: Number,
            required: true,
        }
    }],
});

moduleSchema.index({ 'articles.sequence': 1 }, { unique: true, sparse: true });

const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageLink: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    modules: [{
        module: {
            type: Schema.Types.ObjectId,
            ref: 'Module',
        },
        sequence: {
            type: Number,
            required: true,
            unique: true,
        },
    }],
    published: {
        type: Boolean,
        required: true,
        default: true
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

courseSchema.index({ 'modules.sequence': 1 }, { unique: true, sparse: true });

const Article = mongoose.model('Article', articleSchema);
const Module = model('Module', moduleSchema);
const Course = model('Course', courseSchema);

module.exports = { Course, Module, Article };
