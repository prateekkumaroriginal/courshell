import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CourseSidebar from '@/components/User/CourseSidebar';

const ReadCourse = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState();
    const [enrollment, setEnrollment] = useState();
    const [progressPercentage, setProgressPercentage] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = async () => {
        const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses/${courseId}`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        console.log(data.course);
        console.log(data.enrollment);
        console.log(data.progressPercentage);
        setCourse(data.course);
        setEnrollment(data.enrollment);
        setProgressPercentage(data.progressPercentage);
        setIsLoading(false);
    }

    return (
        <div className='relative h-full z-40'>
            <div className="hidden md:flex h-full flex-col fixed inset-y-0 top-14 p-1 z-40">
                {!isLoading && <CourseSidebar
                    course={course}
                    enrollment={enrollment}
                    progressPercentage={progressPercentage}
                />}
            </div>
        </div>
    )
}

export default ReadCourse