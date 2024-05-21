import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// import ModulesList from './ModulesList';
import { Loader2 } from 'lucide-react';
import { VITE_APP_BACKEND_URL } from '@/constants';

const formSchema = z.object({
    title: z.string().min(4).max(200)
});

const ModulesForm = ({ course, courseId }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    }, []);

    const { handleSubmit, reset, register, formState: { isSubmitting, isValid } } = form;

    const onSubmit = async (values) => {
        try {
            console.log(values);
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            setIsCreating(false);
            reset();
        } catch (e) {
            console.log(e);
        }
    }

    const onReorder = async (updateData) => {
        try {
            setIsUpdating(true);
            await fetch(`http://localhost:3000/instructor/courses/${courseId}/modules/reorder`, {
                method: 'PUT',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    list: updateData
                })
            });
        } catch (e) {
            console.log(e);
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className='relative mt-6 border bg-slate-200 rounded-md p-4'>
            {isUpdating && <div className='absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center'>
                <Loader2 className='animate-spin' />
            </div>}

            <div className='font-medium flex items-center justify-between'>
                <p className='font-bold text-zinc-600 pt-2 pb-4'>Modules</p>
                {isCreating ? <div className='flex gap-x-2'>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            setIsCreating(false)
                            reset()
                        }}>
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={!isValid || isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'>
                        Create
                    </button>
                </div> : <button onClick={() => {
                    setIsCreating(true)
                }}>
                    ➕ Add a Module
                </button>}
            </div>

            {isCreating ? <form
                className='mt-2'
                onSubmit={handleSubmit(onSubmit)}
            >
                <input
                    className='p-1 shadow-lg appearance-none rounded w-full outline-none'
                    type="text"
                    id='title'
                    placeholder="e.g. 'Introduction to the course'"
                    disabled={isSubmitting}
                    {...register('title')}
                />
            </form> : <>
                <div className={!course.modules.length ? 'text-zinc-600 text-sm font-semibold mt-2 italic' : 'mt-2'}>
                    {!course.modules.length && "No Modules"}
                    {/* <ModulesList
                        onReorder={onReorder}
                        items={course.modules || []}
                    /> */}
                </div>
                <div>
                    {course.modules.length !== 0 && <p className='text-xs text-slate-600 mt-4'>
                        Drag and drop to reorder modules
                    </p>}
                </div>
            </>}
        </div>
    )
}

export default ModulesForm