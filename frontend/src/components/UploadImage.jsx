import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const UploadImage = ({ course }) => {
    const [image, setImage] = useState(course.imageLink)
    const form = useForm();

    const { handleSubmit, reset, setValue } = form;
    const { isValid, isSubmitting } = form.formState;

    const onSubmit = () => {
        console.log("Hello");
        const file = form.getValues('imageLink');
        console.log(file);
    }

    const handleFileChange = (e) => {
        try {
            const file = e.target.files[0];
            console.log(file);
            setValue('imageLink', file)
            setImage(URL.createObjectURL(file));
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
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    id="image"
                />
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'>
                    Save
                </button>
            </form>
            <img src={image} alt="h2" />
        </div>
    )
}

export default UploadImage