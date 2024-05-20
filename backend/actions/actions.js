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
                    createdAt: 'desc'
                }
            },
        }
    });
}

export { getInstructorOrAbove, createCourse, getCreatedCourses, getCourse, getUser }