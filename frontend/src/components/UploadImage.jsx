import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const UploadImage = ({ course, courseId }) => {
    const [imageUrl, setImageUrl] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const form = useForm();

    const { handleSubmit, reset } = form;
    const { isSubmitting } = form.formState;

    useEffect(() => {
        if (course.imageId){
            fetchImage();
        }
    }, [])

    const fetchImage = async () => {
        const imageResponse = await fetch(`http://localhost:3000/files/${course.imageId}`)
        setImageUrl(imageResponse.url)
    }

    const onSubmit = async () => {
        try {
            const file = form.getValues('image')[0];
            const formData = new FormData();
            formData.append('file', file);

            await fetch(`http://localhost:3000/instructor/courses/${courseId}`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            document.getElementById("imageUrl").value = "";
            setIsEditing(false);
        } catch (error) {
            console.error('Error while uploading image:', error);
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
                    {...form.register('image')}
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

export default UploadImage