import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useNavigate } from 'react-router-dom';
import { VITE_APP_BACKEND_URL } from '@/constants';

const ArticleActions = ({ disabled, courseId, moduleId, articleId, isPublished }) => {
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
            navigate(`/courses/${courseId}/${moduleId}`);
        } catch (e) {
            console.log(e);
        } finally{
            setIsLoading(false);
        }
    }

    return (
        <div className='flex items-center gap-x-2'>
            <button
                disabled={disabled || isLoading}
                onClick={() => { }}
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