import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod';
import Editor from './Editor';

const formSchema = z.object({
    title: z.string().min(4).max(200),
});

const Article = () => {
    const { courseId, moduleId, articleId } = useParams();
    const [article, setArticle] = useState();
    const [completionText, setCompletionText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: article
    });

    const { handleSubmit, reset, formState: { isSubmitting, isValid } } = form;

    const fetchArticle = async () => {
        const response = await fetch(`http://localhost:3000/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.status === 401) {
            return navigate("/signin");
        }

        if (response.ok) {
            const data = await response.json();
            setArticle(data.article);
            const requiredFields = [
                data.article.title,
                data.article.content
            ];
            const totalFields = requiredFields.length;
            const completedFields = requiredFields.filter(Boolean).length;

            setCompletionText(`${completedFields}/${totalFields}`);
        }
        setIsLoading(false);
    }

    const onSubmit = async (values) => {
        console.log(values);
        try {
            setIsEditing(false);
            const response = await fetch(`http://localhost:3000/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            fetchArticle();
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        fetchArticle();
    }, []);

    return (
        <div className='md:p-6'>
            <div className='flex items-center justify-center mb-8'>
                <div className='w-full'>
                    <Link
                        to={`/courses/${courseId}/${moduleId}`}
                        className='flex w-fit items-center justify-center p-4 rounded-lg font-semibold text-sm text-white bg-gray-700 hover:bg-gray-800'
                    >
                        <ArrowLeft className='w-6 h-6 mr-2' /> Back to Module
                    </Link>
                </div>
            </div>

            <div className='flex items-center justify-between w-full mb-8'>
                <div className='flex flex-col gap-y-2'>
                    <h1 className='text-2xl font-semibold'>Article Creation</h1>
                    <span className='text-sm text-zinc-600'>
                        Completed Fields {!isLoading && <>({completionText})</>}
                    </span>
                </div>
            </div>

            <div className='border bg-slate-200 rounded-md p-4 w-1/2 mb-8'>
                <div className='font-medium flex items-center justify-between'>
                    <p className='font-bold text-zinc-600 py-2'>Article Title</p>

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
                    <input
                        className='p-1 shadow-lg appearance-none rounded w-full outline-none'
                        type="text"
                        id='title'
                        placeholder="e.g. 'Full stack web development'"
                        disabled={isSubmitting}
                        defaultValue={article.title}
                        {...form.register('title')}
                    />
                    <div className="flex items-center">
                    </div>
                </form> : !isLoading && <p className='text-md font-semibold mt-2 py-1'>
                    {article.title}
                </p>}
            </div>

            <div>
                <Editor />
            </div>
        </div>
    )
}

export default Article