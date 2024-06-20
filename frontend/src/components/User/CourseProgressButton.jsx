import React, { useState } from 'react'
import { Button } from '../ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { VITE_APP_BACKEND_URL } from '@/constants'

const CourseProgressButton = ({ articleId, moduleId, courseId, nextArticleId, nextModuleId, isCompleted, setUserProgress, setProgressPercentage }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const Icon = isCompleted ? XCircle : CheckCircle;

    const onClick = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses/${courseId}/articles/${articleId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    isCompleted: !isCompleted
                })
            });

            if (response.ok) {
                toast.success("Progress Updated");
                const data = await response.json();
                setUserProgress(data.userProgress);
                setProgressPercentage(data.progressPercentage);
                if (!isCompleted && nextArticleId) {
                    navigate(`/courses/${courseId}/${nextModuleId ? nextModuleId : moduleId}/${nextArticleId}`);
                }
            } else {
                toast.error("Something went wrong");
            }

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='mt-8'>
            <Button
                onClick={onClick}
                disabled={isLoading}
                type='button'
                variant={isCompleted ? 'default' : 'success'}
                className='w-full md:w-auto'
            >
                {isCompleted ? "Mark as incomplete" : "Mark as complete"}
                <Icon className='h-4 w-4 ml-2' />
            </Button>
        </div>
    )
}

export default CourseProgressButton