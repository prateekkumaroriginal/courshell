import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';

const formSchema = z.object({
    isFree: z.boolean().default(false)
});

const ArticleAccessForm = ({ article, courseId, moduleId, articleId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isFree, setIsFree] = useState(!!article?.isFree);

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "all",
        defaultValues: {
            isFree
        }
    });

    const { handleSubmit, reset, formState: { isSubmitting, isValid } } = form;

    const onSubmit = async (values) => {
        try {
            setIsEditing(false);
            const updatingToast = toast.loading("Updating...");
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            toast.dismiss(updatingToast);

            if (response.ok) {
                setIsFree(values.isFree);
                toast.success("Article Updated");
            } else {
                toast.error("Something went wrong");
            }
        } catch (e) {
            console.log(e);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className='border bg-slate-200 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                <p className='font-bold text-zinc-600 py-2'>Article Access</p>

                {isEditing ? <div className='flex gap-x-2'>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            setIsEditing(false)
                            reset()
                        }}>
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={!isValid || isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'>
                        Save
                    </button>
                </div> : <button onClick={() => {
                    setIsEditing(true)
                }}>
                    🖋 Edit
                </button>}
            </div>

            {isEditing ? <form
                className='mt-2'
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className='flex'>
                    <div className='flex items-center'>
                        <input
                            className='mr-2 mt-2 py-1 h-4 w-4'
                            type="checkbox"
                            id='isFree'
                            defaultChecked={article.isFree}
                            {...form.register('isFree')}
                        />
                    </div>
                    <div className='flex items-center'>
                        <label htmlFor="isFree" className='text-md font-semibold mt-2 py-1'>
                            Free
                        </label>
                    </div>
                </div>
                <div>
                    <p className='text-xs text-slate-600'>
                        Check this box if you want to make this article free for preview
                    </p>
                </div>
            </form> : <div>
                <p className={`text-md font-semibold italic mt-2 py-1 ${isFree ? 'text-blue-500' : 'text-red-500'}`}>
                    {isFree ? "This article is free for preview" : "This article is not free for preview"}
                </p>
            </div>}
        </div>
    )
}

export default ArticleAccessForm