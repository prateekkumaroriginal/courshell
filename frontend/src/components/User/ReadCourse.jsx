import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CourseSidebar from '@/components/User/CourseSidebar';
import ReadArticle from '@/components/User/ReadArticle';
import CourseEnrollButton from '@/components/User/CourseEnrollButton';

const ReadCourse = ({ userRole }) => {
    const { courseId, articleId } = useParams();
    const [course, setCourse] = useState();
    const [enrollment, setEnrollment] = useState();
    const [progressPercentage, setProgressPercentage] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
        setCourse(data.course);
        setEnrollment(data.enrollment);
        setProgressPercentage(data.progressPercentage);
        setIsLoading(false);
    }

    if (isLoading) {
        return <div className='text-center text-2xl text-muted-foreground mt-10'>
            Loading... yo
        </div>
    }

    return (
        <>
            {isLoading ? <div className='text-center text-2xl text-muted-foreground mt-10'>
                Loading...
            </div> : (
                <div className='relative h-full z-40 mb-20'>
                    <div className='px-20 flex items-center justify-center'>
                        {!enrollment && <CourseEnrollButton
                            courseId={courseId}
                            requested={course?.requestedUsers?.length}
                            userRole={userRole}
                        />}
                    </div>
                </div>
            )}
        </>
    )
}

export default ReadCourse