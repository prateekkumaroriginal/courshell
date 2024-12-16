import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import Banner from '../ui/Banner';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import CourseProgressButton from './CourseProgressButton';
import CourseSidebar from './CourseSidebar';

const ReadArticle = () => {
    const { courseId, moduleId, articleId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [article, setArticle] = useState();
    const [nextArticle, setNextArticle] = useState();
    const [nextModule, setNextModule] = useState();
    const [course, setCourse] = useState();
    const [isLocked, setIsLocked] = useState();
    const [userProgress, setUserProgress] = useState();
    const [enrollment, setEnrollment] = useState();
    const [progressPercentage, setProgressPercentage] = useState();

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

    const fetchArticle = async () => {
        setIsLoading(true);
        try {
            if (articleId) {
                const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
                    method: 'GET',
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setArticle(data.article);
                    setCourse(data.course);
                    setIsLocked(!data.article.isFree && !data.enrollment);
                    setProgressPercentage(data.progressPercentage);
                    setUserProgress(data.userProgress);
                    setNextArticle(data.nextArticle);
                    setNextModule(data.nextModule);
                    setEnrollment(data.enrollment);
                    console.log(data);
                } else {
                    toast.error("Something went wrong");
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading || !articleId) {
        return <div className='text-center text-2xl text-muted-foreground mt-10'>
            Loading...
        </div>
    }

    if (!article || !course) {
        return <div className='text-center text-2xl text-muted-foreground mt-10'>
            Article or course not found.
        </div>
    }

    return (
        <>
            <div className="flex h-full flex-col fixed inset-y-0 top-14 z-40">
                {course && <CourseSidebar
                    course={course}
                    enrollment={enrollment}
                    progressPercentage={progressPercentage}
                />}
            </div>

            {!isLoading && <div className='px-20'>
                {userProgress?.isCompleted && <Banner
                    label="You have completed this article."
                    variant="SUCCESS"
                />}

                {isLocked ? <Banner
                    label="You need to enroll in this course to read this article."
                    variant="WARNING"
                /> : (
                    <div className='flex flex-col mx-auto'>
                        <div className="py-8">
                            <h1 className='text-3xl text-center'>{article.title}</h1>
                            <div className='pt-8'>
                                {parse(article.content)}
                            </div>

                            {enrollment && <div>
                                <CourseProgressButton
                                    articleId={articleId}
                                    moduleId={moduleId}
                                    courseId={courseId}
                                    nextArticleId={nextArticle?.id}
                                    nextModuleId={nextModule?.id}
                                    isCompleted={!!userProgress?.isCompleted}
                                    setUserProgress={setUserProgress}
                                    setProgressPercentage={setProgressPercentage}
                                />
                            </div>}
                        </div>
                    </div>
                )}
            </div>}
        </>
    )
}

export default ReadArticle