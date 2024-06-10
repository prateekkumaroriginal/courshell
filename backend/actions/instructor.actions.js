import { db } from '../db/index.js';

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

const publishCourse = async (course) => {
    const allFieldsFilled = allFieldsHaveValue(course);
    if (!allFieldsFilled) {
        return false;
    }
    if (!course.modules.some(module => (
        module.articles.some(article => article.isPublished)
    ))) {
        return false;
    }

    return await db.course.update({
        where: {
            id: course.id
        },
        data: {
            isPublished: true
        }
    });
}

const unpublishCourse = async (courseId) => {
    return await db.course.update({
        where: {
            id: courseId
        },
        data: {
            isPublished: false
        }
    });
}

const deleteCourse = async (courseId) => {
    return await db.course.delete({
        where: {
            id: courseId
        }
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

const allFieldsHaveValue = (obj) => {
    return Object.values(obj).every(value => value !== null && value !== undefined);
}

const publishArticle = async (moduleId, article) => {
    const allFieldsFilled = allFieldsHaveValue(article);
    if (!allFieldsFilled) {
        return false;
    }

    return await db.article.update({
        where: {
            moduleId,
            id: article.id
        },
        data: {
            isPublished: true
        }
    });
}

const unpublishArticle = async (moduleId, articleId) => {
    return await db.article.update({
        where: {
            moduleId,
            id: articleId
        },
        data: {
            isPublished: false
        }
    });
}

const createAttachment = async (file, courseId, isCoverImage = false) => {
    const timestamp = Date.now();
    return await db.attachment.create({
        data: {
            name: `${file.originalname}-${timestamp}`,
            originalName: file.originalname,
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

const getAttachments = async (courseId, includeData = false) => {
    if (includeData !== false && includeData !== true) {
        includeData = false;
    }

    const selectFields = {
        id: true,
        name: true,
        originalName: true,
        type: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
        ...(includeData && { data: true })
    };

    return await db.attachment.findMany({
        where: {
            courseId,
            isCoverImage: false
        },
        select: selectFields
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

const groupEnrollmentsByCourse = (enrollments) => {
    const grouped = {};
    enrollments.forEach(enrollment => {
        const courseId = enrollment.course.id;
        if (!grouped[courseId]) {
            grouped[courseId] = {
                total: 0,
                title: enrollment.course.title
            };
        }
        grouped[courseId].total += enrollment.course.price;
    });
    return grouped;
}

export { createCourse, getCreatedCourses, getCourse, createModule, getModule, updateModule, getLastModule, deleteAttachment, getAttachment, getAttachments, createAttachment, updateCourse, getArticle, createArticle, updateArticle, getLastArticle, deleteArticle, publishArticle, unpublishArticle, publishCourse, unpublishCourse, deleteCourse, groupEnrollmentsByCourse }