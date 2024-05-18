import { db } from '../db/index.js';

const getInstructorOrAbove = async (email) => {
    return await db.user.findUnique({
        where: {
            email,
            OR: [
                { role: 'INSTRUCTOR' },
                { role: 'ADMIN' },
                { role: 'SUPERADMIN' }
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
    const courses = await db.course.findMany({
        where: {
            instructorId
        }
    });
}

export { getInstructorOrAbove, createCourse, getCreatedCourses }