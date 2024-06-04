import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CourseSidebar from '@/components/User/CourseSidebar';
import ReadArticle from '@/components/User/ReadArticle';
import ToastProvider from '../ui/ToastProvider';

const ReadCourse = () => {
    const { courseId, articleId } = useParams();
    const [course, setCourse] = useState();
    const [enrollment, setEnrollment] = useState();
    const [progressPercentage, setProgressPercentage] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isCourseLoading, setIsCourseLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourse();
    }, []);

    useEffect(() => {
        if (!isLoading && !articleId) {
            navigate(`/courses/${courseId}/${course?.modules[0]?.articles[0]?.id}`);
        }
    }, [isLoading]);

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
        setIsCourseLoading(false);
    }

    return (
        <>
            <ToastProvider/>
            {!isCourseLoading && !course ? null : <div className='relative h-full z-40'>
                <div className="flex h-full flex-col fixed inset-y-0 top-14 z-40">
                    {!isCourseLoading && <CourseSidebar
                        course={course}
                        enrollment={enrollment}
                        progressPercentage={progressPercentage}
                    />}
                </div>

                <div className='px-20'>
                    <ReadArticle
                        courseId={courseId}
                        articleId={articleId}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                </div>
            </div>}
        </>
    )
}

export default ReadCourse