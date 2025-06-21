import { db } from "../prisma/index.js";
import { SUPERADMIN, ADMIN, INSTRUCTOR } from '../constants.js';

const getUser = async (email) => {
    return await db.user.findUnique({
        where: {
            email,
        },
        select: {
            email: true,
            role: true
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

const getCourse = async (courseId, userId) => {
    const course = await db.course.findUnique({
        where: {
            id: courseId,
            isPublished: true
        },
        include: {
            instructor: true,
            modules: {
                where: {
                    articles: {
                        some: {
                            isPublished: true
                        }
                    }
                },
                include: {
                    articles: {
                        where: {
                            isPublished: true
                        },
                        select: {
                            id: true,
                            title: true,
                            isFree: true,
                            content: true,
                            ...(userId && {
                                userProgress: {
                                    where: {
                                        userId
                                    }
                                }
                            })
                        },
                        orderBy: {
                            position: 'asc'
                        }
                    }
                },
                orderBy: {
                    position: 'asc'
                }
            },
            ...(userId && {
                attachments: {
                    where: {
                        isCoverImage: false
                    },
                    select: {
                        id: true,
                        name: true,
                        originalName: true,
                        type: true
                    }
                },
                requestedUsers: {
                    where: {
                        userId,
                        courseId
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    take: 1
                }
            })
        }
    });

    if (!course) {
        return null;
    }

    course.modules.forEach(module => {
        module.articles.forEach(article => {
            if (!article.isFree) {
                delete article.content;
            }
        });
    });

    return course;
}

const getEnrollment = async (courseId, userId) => {
    return await db.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        }
    });
}

const getProgress = async (courseId, userId) => {
    const modules = await db.module.findMany({
        where: {
            courseId
        }
    });

    const publishedArticles = [];
    for (const module of modules) {
        publishedArticles.push(...(await db.article.findMany({
            where: {
                moduleId: module.id,
                isPublished: true
            },
            select: {
                id: true
            }
        })));
    }

    const publishedArticleIds = publishedArticles.map(article => article.id);

    const validCompletedArticles = await db.userProgress.count({
        where: {
            userId,
            articleId: {
                in: publishedArticleIds
            },
            isCompleted: true
        }
    });

    const progressPercentage = (validCompletedArticles / publishedArticleIds.length) * 100;
    return progressPercentage;
}

const getArticleProgress = async (articleId, userId) => {
    return await db.userProgress.findUnique({
        where: {
            userId_articleId: {
                userId,
                articleId
            }
        }
    });
}

const getAllCourses = async (userId, categoryId, title) => {
    const courses = await db.course.findMany({
        where: {
            isPublished: true,
            title: {
                contains: title || '',
                mode: 'insensitive'
            },
            ...(categoryId && { categoryId })
        },
        include: {
            category: true,
            modules: {
                include: {
                    articles: {
                        where: {
                            isPublished: true
                        },
                        select: {
                            id: true
                        }
                    }
                }
            },
            ...(userId && {
                enrolledUsers: {
                    where: {
                        userId
                    }
                }
            })
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const coursesWithProgress = await Promise.all(
        courses.map(async course => {
            if (!userId || course.enrolledUsers.length === 0) {
                return {
                    ...course,
                    progress: null
                }
            }

            const progressPercentage = await getProgress(course.id, userId);
            return {
                ...course,
                progress: progressPercentage
            }
        })
    );

    return coursesWithProgress;
}

const getArticle = async (articleId) => {
    return await db.article.findUnique({
        where: {
            id: articleId,
            isPublished: true
        }
    });
}

export { getUser, getInstructorOrAbove, getCourse, getEnrollment, getProgress, getAllCourses, getArticle, getArticleProgress }