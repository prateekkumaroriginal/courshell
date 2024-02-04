import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const UploadImage = ({ course, courseId }) => {
    const [imageUrl, setImageUrl] = useState()
    const form = useForm();

    const { handleSubmit} = form;
    const { isSubmitting } = form.formState;

    useEffect(() => {
        fetchImage();
    }, [])

    const fetchImage = async () => {
        const imageResponse = await fetch(`http://localhost:3000/files/images/${course.imageId}`)
        setImageUrl(imageResponse.url)
    }

    const onSubmit = async () => {
        try {
            const file = form.getValues('imageLink')[0];
            const formData = new FormData();
            formData.append('file', file);

            await fetch(`http://localhost:3000/instructor/courses/${courseId}`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
        } catch (error) {
            console.error('Error while uploading image:', error);
        }
    }

    const handleFileChange = (e) => {
        try {
            const file = e.target.files[0];
            setImageUrl(URL.createObjectURL(file));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='p-10'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    className='p-1 shadow-lg appearance-none rounded w-full'
                    disabled={isSubmitting}
                    {...form.register('imageLink')}
                    type="file"
                    onChange={handleFileChange}
                    id="imageUrl"
                />
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'>
                    Save
                </button>
            </form>
            <img src={imageUrl} alt="h2" />
        </div>
    )
}

export default UploadImage