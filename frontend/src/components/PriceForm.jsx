import React, { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'


const PriceForm = ({ course, courseId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [price, setPrice] = useState(course.price);

    const form = useForm({
        defaultValues: course
    }, [course]);

    const { handleSubmit, reset } = form;
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
                body: JSON.stringify({price: parseInt(values.price)})
            });
            setPrice(parseInt(values.price));
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='mt-6 border bg-slate-200 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                <p className='text-zinc-600 py-2'>Course Price</p>

                {isEditing ? <div className='flex gap-x-2'>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            setIsEditing(false)
                            reset(course)
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
                    type="number"
                    id='price'
                    placeholder="Enter course selling price..."
                    disabled={isSubmitting}
                    defaultValue={course.price}
                    {...form.register('price')}
                />
            </form> : <p className='text-md font-semibold mt-2 py-1'>
                {price || "Not set"}
            </p>}
        </div>
    )
}

export default PriceForm