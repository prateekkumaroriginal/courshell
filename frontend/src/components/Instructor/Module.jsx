import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import ArticlesList from '@/components/Instructor/ArticlesList';
import { Loader2 } from 'lucide-react';
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const formSchema = z.object({
    title: z.string().min(4).max(200),
});

const Module = () => {
    const { courseId, moduleId } = useParams();
    const [module, setModule] = useState();
    const [title, setTitle] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const moduleForm = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: module
    });

    const {
        handleSubmit: moduleHandleSubmit,
        reset: moduleReset,
        formState: { isSubmitting: moduleIsSubmitting, isValid: moduleIsValid }
    } = moduleForm;

    const articleForm = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: ""
        }
    });

    const {
        handleSubmit: articleHandleSubmit,
        reset: articleReset,
        formState: { isSubmitting: articleIsSubmitting, isValid: articleIsValid }
    } = articleForm;


    const fetchModule = async () => {
        const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            setModule(data.module);
            setTitle(data.module.title);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchModule();
    }, []);

    const moduleOnSubmit = async (values) => {
        try {
            setIsEditing(false);
            const updatingToast = toast.loading("Updating...");
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}`, {
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
                toast.success("Module Title Updated");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    const articleOnSubmit = async (values) => {
        try {
            setIsCreating(false);
            const creatingToast = toast.loading("Creating...");
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}/articles`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            toast.dismiss(creatingToast);

            if (response.ok) {
                toast.success("Article Created");
                articleReset();
                fetchModule();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    const onReorder = async (updateData) => {
        try {
            setIsUpdating(true);
            const reorderToast = toast.loading("Reordering..");
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}/reorder`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    list: updateData
                })
            });
            toast.dismiss(reorderToast);

            if (response.ok) {
                toast.success("Articles Reorder Successfull");
            } else {
                toast.error("Something went wrong");
            }
        } catch (e) {
            console.log(e);
            toast.error("Something went wrong");
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className='md:p-6'>
            <div className="p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">
                                <span>
                                    {module?.course?.title}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className='mt-6 border bg-slate-200 rounded-md p-4'>
                        <div className='font-medium flex items-center justify-between'>
                            <p className='font-bold text-zinc-600 py-2'>Module Title</p>

                            {isEditing ? <div className='flex gap-x-2'>
                                <button
                                    className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                                    onClick={() => {
                                        setIsEditing(false)
                                        moduleReset()
                                    }}>
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={!moduleIsValid || moduleIsSubmitting}
                                    onClick={moduleHandleSubmit(moduleOnSubmit)}
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
                            onSubmit={moduleHandleSubmit(moduleOnSubmit)}
                        >
                            <input
                                className='p-1 shadow-lg appearance-none rounded w-full outline-none'
                                type="text"
                                id='title'
                                placeholder="e.g. 'Intro to web development'"
                                disabled={moduleIsSubmitting}
                                defaultValue={module?.title}
                                {...moduleForm.register('title')}
                            />
                            <div className="flex items-center">
                            </div>
                        </form> : !isLoading && <div className='text-md font-semibold mt-2 py-1'>
                            {title}
                        </div>}
                    </div>
                </div>

                <div>
                    <div className='relative mt-6 border bg-slate-200 rounded-md p-4'>
                        {isUpdating && <div className='absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center'>
                            <Loader2 className='animate-spin' />
                        </div>}

                        <div className='font-medium flex items-center justify-between'>
                            <p className='font-bold text-zinc-600 pt-2 pb-4'>Articles</p>
                            {isCreating ? <div className='flex gap-x-2'>
                                <button
                                    className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                                    onClick={() => {
                                        setIsCreating(false)
                                        articleReset()
                                    }}>
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={!articleIsValid || articleIsSubmitting}
                                    onClick={articleHandleSubmit(articleOnSubmit)}
                                    className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'>
                                    Create
                                </button>
                            </div> : <button onClick={() => {
                                setIsCreating(true)
                            }}>
                                ➕ Add an Article
                            </button>}
                        </div>

                        {isCreating ? <form
                            className='mt-2'
                            onSubmit={articleHandleSubmit(articleOnSubmit)}
                        >
                            <input
                                className='p-1 shadow-lg appearance-none rounded w-full outline-none'
                                type="text"
                                id='title'
                                placeholder="e.g. 'Introduction to the course'"
                                disabled={articleIsSubmitting}
                                {...articleForm.register('title')}
                            />
                        </form> : !isLoading && <>
                            <div className={!module.articles.length ? 'text-zinc-600 text-sm font-semibold mt-2 italic' : 'mt-2'}>
                                {!module.articles.length && "No Articles"}
                                <ArticlesList
                                    onReorder={onReorder}
                                    items={module.articles || []}
                                />
                            </div>
                            <div>
                                {module.articles.length !== 0 && <p className='text-xs text-slate-600 mt-4'>
                                    Drag and drop to reorder articles
                                </p>}
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Module