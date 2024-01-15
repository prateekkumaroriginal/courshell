import React, { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const formSchema = z.object({
    description: z.string().min(4, {
        message: 'Description must have atleast 4 characters'
    })
})

const DescriptionForm = ({ course, courseId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: course
    });

    const { handleSubmit } = form;
    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values) => {
        try {
            setIsEditing(false);
            await fetch(`http://localhost:3000/instructor/courses/${courseId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='mt-6 border bg-slate-200 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                <p className='text-zinc-600 py-2'>Course Description</p>

                {isEditing ? <div className='flex gap-x-2'>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            setIsEditing(false)
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
                <textarea
                    className='p-1 shadow-lg appearance-none rounded w-full min-h-14'
                    type="text"
                    id='description'
                    placeholder="e.g. 'This is the best course for full stack web development from beginner to advanced.'"
                    disabled={isSubmitting}
                    defaultValue={course.description}
                    {...form.register('description')}
                />
                <div className="flex items-center">
                </div>
            </form> : <p className='text-md font-semibold mt-2 py-1'>
                {course.description || <span className='text-sm italic text-zinc-600'>No Description</span>}
            </p>}
        </div>
    )
}

export default DescriptionForm