import { VITE_APP_BACKEND_URL } from '@/constants'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast';

const CoverImage = ({ course, courseId }) => {
    const [imageUrl, setImageUrl] = useState(course.coverImage && `data:image/jpeg;base64,${course.coverImage}`);
    const [isEditing, setIsEditing] = useState(false);
    const form = useForm();

    const { handleSubmit, reset, register, formState: { isSubmitting } } = form;

    const onSubmit = async () => {
        try {
            const updatingToast = toast.loading("Updating...");
            const file = form.getValues('image')[0];
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.dismiss(updatingToast);

            if (response.ok) {
                toast.success("Article Updated");
            } else {
                toast.error("Something went wrong");
                setImageUrl(`data:image/jpeg;base64,${course.coverImage}`);
            }
            document.getElementById("imageUrl").value = "";
            setIsEditing(false);
        } catch (error) {
            console.error('Error while uploading image:', error);
            toast.error("Something went wrong");
            setImageUrl(`data:image/jpeg;base64,${course.coverImage}`);
        }
    }

    const handleFileChange = (e) => {
        try {
            const file = e.target.files[0];
            setImageUrl(URL.createObjectURL(file));
            setIsEditing(true);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='mt-6 border bg-slate-200 rounded-md p-4'>
            <p className='font-bold text-zinc-600 pt-2 pb-4'>Course Cover Image</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    className='p-1 mb-6 shadow-lg bg-white appearance-none rounded w-full'
                    disabled={isSubmitting}
                    {...register('image')}
                    type="file"
                    onChange={handleFileChange}
                    id="imageUrl"
                />
                {isEditing && <>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            setIsEditing(false);
                            fetchImage();
                            reset(form);
                            document.getElementById("imageUrl").value = "";
                        }}>
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'>
                        Save
                    </button>
                </>}
            </form>
            <img className='rounded-md' src={imageUrl} alt="h2" />
        </div>
    )
}

export default CoverImage