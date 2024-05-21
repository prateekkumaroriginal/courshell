import React from 'react'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VITE_APP_BACKEND_URL } from '@/constants'

const formSchema = z.object({
    title: z.string().min(4).max(200)
});

const Create = () => {
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: ""
        }
    });

    const { handleSubmit, reset, formState: { isSubmitting, isValid } } = form;

    const onSubmit = async (values) => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses`, {
                method: 'POST',
                body: JSON.stringify(values),
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                }
            });
            const data = await response.json();
            return navigate(`/courses/${data.courseId}`);
        } catch (error) {
            console.log("Something went wrong");
        }
    }

    return (
        <div className='max-w-5xl mx-auto flex flex-wrap items-center justify-center h-full p-6'>
            <div className='mt-8'>
                <h1 className='text-4xl'>
                    Name your course
                </h1>
                <p className='text-sm text-zinc-600'>What are you going to name your course? Don't worry you can change it later.</p>
            </div>

            <div className='w-[520px]'>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='mt-8'
                >
                    <div>
                        <label className='text-gray-700 text-xl font-bold mr-4' htmlFor="title">Course Title</label>
                        <input className='p-1 shadow-lg appearance-none border-2 rounded w-full hover:bg-zinc-200/40 focus:bg-zinc-200/40'
                            disabled={isSubmitting}
                            placeholder="e.g. 'Full Stack Web Development'"
                            type="text"
                            id='title'
                            {...form.register('title')}
                        />
                    </div>
                    <div className='flex gap-2 mt-8'>
                        <button
                            className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className={!isValid || isSubmitting ? 'px-4 py-2 text-white font-semibold bg-gray-300 rounded-md' : 'px-4 py-2 text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-600 rounded-md'}
                            disabled={!isValid || isSubmitting}
                        >
                            Continue
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default Create