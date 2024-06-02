import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useNavigate } from 'react-router-dom';
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';

const ArticleActions = ({ disabled, courseId, moduleId, articleId, isPublished, setIsPublished }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onDelete = async () => {
        try {
            setIsLoading(true);
            await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
                method: 'DELETE',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                }
            });
            navigate(`/instructor/courses/${courseId}/${moduleId}`);
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    }

    const onClick = async () => {
        try {
            setIsLoading(true);
            const publishToast = toast.loading(`${isPublished ? 'Unpublishing' : 'Publishing'} Article...`);
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}/${isPublished ? 'unpublish' : 'publish'}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            toast.dismiss(publishToast);

            if (response.ok) {
                setIsPublished(isPublished ? false : true);
                toast.success(`Article ${isPublished ? 'Unpublished' : 'Published'}`);
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
        <div className='flex items-center gap-x-2'>
            <button
                disabled={disabled || isLoading}
                onClick={onClick}
                className={isPublished ? 'px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md' : 'px-4 py-2 text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-600 rounded-md'}
            >
                {isPublished ? "Unpublish" : "Publish"}
            </button>

            <button
                onClick={() => { setOpen(true) }}
                className="block text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-md p-2"
            >
                <Trash2
                    className='h-6 w-6'
                />
            </button>

            <ConfirmModal
                open={open}
                onClose={() => { setOpen(false) }}
                onConfirm={onDelete}
            />
        </div>
    )
}

export default ArticleActions