import { db } from "../db/index.js";
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

const getCourse = async (courseId, userId) => {
    return await db.course.findUnique({
        where: {
            id: courseId,
            isPublished: true
        },
        include: {
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
                        include: {
                            userProgress: {
                                where: {
                                    userId
                                }
                            }
                        },
                        orderBy: {
                            position: 'asc'
                        }
                    }
                },
                orderBy: {
                    position: 'asc'
                }
            }
        }
    });
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

const getAllCourses = async ({ userId, categoryId, title }) => {
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
            coverImage: true,
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
            enrolledUsers: {
                where: {
                    userId
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const coursesWithProgress = await Promise.all(
        courses.map(async course => {
            if (course.enrolledUsers.length === 0) {
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

export { getUser, getInstructorOrAbove, getCourse, getEnrollment, getProgress, getAllCourses }