import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod';
import Editor from '@/components/Instructor/Editor';
import ArticleAccessForm from '@/components/Instructor/ArticleAccessForm';
import Banner from '@/components/ui/Banner';
import ArticleActions from '@/components/Instructor/ArticleActions';
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const formSchema = z.object({
    title: z.string().min(4).max(200),
});

const Article = () => {
    const { courseId, moduleId, articleId } = useParams();
    const [article, setArticle] = useState();
    const [title, setTitle] = useState();
    const [completionText, setCompletionText] = useState("");
    const [isComplete, setIsComplete] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPublished, setIsPublished] = useState();
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isFree: !!article?.isFree
        }
    });

    const { handleSubmit, reset, formState: { isSubmitting, isValid } } = form;

    const fetchArticle = async () => {
        const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
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
            setTitle(data.article.title);
            setIsPublished(data.article.isPublished);
            const requiredFields = [
                data.article.title,
                data.article.content
            ];
            const totalFields = requiredFields.length;
            const completedFields = requiredFields.filter(Boolean).length;
            setIsComplete(requiredFields.every(Boolean));

            setCompletionText(`${completedFields}/${totalFields}`);
        }
        setIsLoading(false);
    }

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
                setTitle(values.title);
                toast.success("Article Updated");
            } else {
                toast.error("Something went wrong");
            }
        } catch (e) {
            console.log(e);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        fetchArticle();
    }, []);

    return (
        <div className='md:px-6'>
            {!isLoading && !isPublished && <Banner
                label={"This article is unpublished. It will not be visible in the course."}
                variant={"WARNING"}
            />}

            <div className='flex items-center my-4'>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">
                                <span>
                                    {article?.module?.course?.title}
                                </span>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">
                                <span>
                                    {article?.module?.title}
                                </span>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>


            <div className='flex items-center gap-x-8 w-full mb-8'>
                <div className='flex flex-col'>
                    <h1 className='text-3xl font-semibold'>Article Settings</h1>
                    <span className='text-sm text-zinc-600'>
                        Completed Fields {!isLoading && <>({completionText})</>}
                    </span>
                </div>

                {!isLoading && <ArticleActions
                    disabled={!isComplete}
                    courseId={courseId}
                    moduleId={moduleId}
                    articleId={articleId}
                    isPublished={isPublished}
                    setIsPublished={setIsPublished}
                />}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-12'>
                <div className='border bg-slate-200 rounded-md p-4'>
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
                            defaultValue={article?.title}
                            {...form.register('title')}
                        />
                        <div className="flex items-center">
                        </div>
                    </form> : !isLoading && <p className='text-md font-semibold mt-2 py-1'>
                        {title}
                    </p>}
                </div>

                {!isLoading && <ArticleAccessForm
                    article={article}
                    courseId={courseId}
                    moduleId={moduleId}
                    articleId={articleId}
                />}
            </div>

            <div className='flex items-center justify-between w-full mb-8'>
                <div className='flex flex-col gap-y-2'>
                    <h1 className='text-2xl font-semibold'>Article Creation</h1>
                </div>
            </div>

            <div>
                {!isLoading && <Editor defaultContent={article.content} setIsComplete={setIsComplete} setCompletionText={setCompletionText} />}
            </div>
        </div>
    )
}

export default Article