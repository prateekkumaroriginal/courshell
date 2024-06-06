import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import Banner from '../ui/Banner';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const ReadArticle = ({ isLoading, setIsLoading }) => {
    const { courseId, articleId } = useParams();
    const [article, setArticle] = useState();
    const [course, setCourse] = useState();
    const [isLocked, setIsLocked] = useState();
    const [userProgress, setUserProgress] = useState();

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

    const fetchArticle = async () => {
        setIsLoading(true);
        if (articleId !== undefined) {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses/${courseId}/articles/${articleId}`, {
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
                setUserProgress(data.userProgress);
                console.log(data);
            } else {
                toast.error("Something went wrong");
            }
        }
        setIsLoading(false);
    }

    if (isLoading || articleId === undefined) {
        return <div className='text-center text-2xl text-muted-foreground mt-10'>
            Loading...
        </div>
    }

    if (!(articleId === undefined) && !article || !course) {
        return <div className='text-center text-2xl text-muted-foreground mt-10'>
            Article or course not found.
        </div>
    }

    return (
        <>
            {!isLoading && <div>
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
                        </div>
                    </div>
                )}
            </div>}
        </>
    )
}

export default ReadArticle