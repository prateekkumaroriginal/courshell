import { db } from '../db/index.js';
import { SUPERADMIN, ADMIN, INSTRUCTOR } from '../constants.js';

const getUser = async (email) => {
    return await db.user.findUnique({
        where: {
            email,
        },
        select: {
            email: true,
            role: true,
            createdCourses: true,
            enrolledCourses: true
        }
    });
}

const getInstructorOrAbove = async (email) => {
    return await db.user.findUnique({
        where: {
            email,
            OR: [
                { role: SUPERADMIN },
                { role: ADMIN },
                { role: INSTRUCTOR }
            ]
        }
    });
}

const createCourse = async (title, instructorId) => {
    return await db.course.create({
        data: {
            title,
            instructorId
        }
    });
}

const getCreatedCourses = async (instructorId) => {
    return await db.course.findMany({
        where: {
            instructorId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

const getCourse = async (courseId) => {
    return await db.course.findUnique({
        where: {
            id: courseId
        },
        include: {
            instructor: true,
            modules: {
                orderBy: {
                    position: 'asc'
                },
                include: {
                    articles: true
                }
            },
        }
    });
}

const updateCourse = async (courseId, data) => {
    return await db.course.update({
        where: {
            id: courseId
        },
        data
    });
}

const createModule = async (title, position, courseId) => {
    return await db.module.create({
        data: {
            title,
            position,
            courseId
        }
    });
}

const getModule = async (courseId, moduleId) => {
    return await db.module.findUnique({
        where: {
            courseId,
            id: moduleId
        },
        include: {
            articles: {
                orderBy: {
                    position: 'asc'
                }
            }
        }
    });
}

const getLastModule = async (courseId) => {
    return await db.module.findFirst({
        where: {
            courseId
        },
        orderBy: {
            position: "desc"
        }
    });
}

const updateModule = async (moduleId, data) => {
    return await db.module.update({
        where: {
            id: moduleId
        },
        data
    });
}

const createArticle = async (title, position, moduleId) => {
    return await db.article.create({
        data: {
            title,
            position,
            moduleId
        }
    });
}

const getArticle = async (moduleId, articleId) => {
    return await db.article.findUnique({
        where: {
            moduleId,
            id: articleId
        }
    });
}

const updateArticle = async (articleId, data) => {
    return await db.article.update({
        where: {
            id: articleId
        },
        data
    });
}

const getLastArticle = async (moduleId) => {
    return await db.article.findFirst({
        where: {
            moduleId
        },
        orderBy: {
            position: "desc"
        }
    });
}

const deleteArticle = async (moduleId, articleId) => {
    return await db.article.delete({
        where: {
            moduleId,
            id: articleId
        },
    });
}

const createAttachment = async (file, courseId, isCoverImage = false) => {
    const timestamp = Date.now();
    return await db.attachment.create({
        data: {
            name: `${file.originalname}-${timestamp}`,
            data: file.buffer,
            type: file.mimetype,
            courseId,
            isCoverImage
        }
    });
}

const getAttachment = async (courseId, attachmentId) => {
    return await db.attachment.findUnique({
        where: {
            courseId,
            id: attachmentId,
        }
    });
}

const getAttachments = async (courseId) => {
    return await db.attachment.findMany({
        where: {
            courseId
        }
    });
}

const deleteAttachment = async (courseId, attachmentId) => {
    return await db.attachment.delete({
        where: {
            courseId,
            id: attachmentId,
        }
    });
}

export { getInstructorOrAbove, createCourse, getCreatedCourses, getCourse, getUser, createModule, getModule, updateModule, getLastModule, deleteAttachment, getAttachment, getAttachments, createAttachment, updateCourse, getArticle, createArticle, updateArticle, getLastArticle, deleteArticle }