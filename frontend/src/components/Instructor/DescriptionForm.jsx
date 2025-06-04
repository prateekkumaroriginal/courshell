import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { VITE_APP_BACKEND_URL } from '@/constants';
import CustomInput from '@/components/ui/CustomInput';
import toast from 'react-hot-toast';

const formSchema = z.object({
    description: z.string().min(4)
});

const DescriptionForm = ({ course, courseId, description, setDescription }) => {
    const [isEditing, setIsEditing] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "all",
        defaultValues: {
            description
        }
    }, []);

    const { handleSubmit, reset, register, formState: { isSubmitting, isValid, errors } } = form;

    const onSubmit = async (values) => {
        try {
            setIsEditing(false);
            const updatingToast = toast.loading("Updating...");
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            toast.dismiss(updatingToast);

            if (response.ok) {
                setDescription(values.description);
                toast.success("Course Description Updated");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className='mt-6 border bg-slate-200 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                <p className='font-bold text-zinc-600 py-2'>Course Description</p>

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
                <CustomInput
                    type={"textarea"}
                    name={"description"}
                    register={register}
                    defaultValue={description}
                    errors={errors}
                />
            </form> : <p className='text-md font-semibold mt-2 py-1'>
                {description || <span className='text-sm italic text-zinc-600'>Not set</span>}
            </p>}
        </div>
    )
}

export default DescriptionForm