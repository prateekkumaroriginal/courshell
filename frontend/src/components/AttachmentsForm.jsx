import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const AttachmentsForm = ({ course, courseId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const form = useForm();
    const { isSubmitting, handleSubmit, reset, formState: { isDirty } } = form;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await fetch(`http://localhost:3000/instructor/courses/${courseId}/attachments`, {
            headers: {
                authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        const data = await response.json();
        setAttachments(data.attachments);

    }

    const onSubmit = async () => {
        try {
            const files = form.getValues('file')
            const formData = new FormData();

            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]);
            }

            await fetch(`http://localhost:3000/instructor/courses/${courseId}/attachments`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            })
        } catch (error) {
            console.error("Error while uploading files: ", error);
        }
        document.getElementById('file').value = '';
        setIsEditing(false);
    }


    return (
        <div className='mt-6 border bg-slate-200 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                <p className='font-bold text-zinc-600 py-4'>Course Attachments</p>

                {isEditing ? <div className='flex gap-x-2'>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            setIsEditing(false);
                            reset(form);
                        }}>
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={!isDirty || isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'>
                        Save
                    </button>
                </div> : <button onClick={() => {
                    setIsEditing(true)
                }}>
                    ⬆ Add a File
                </button>}
            </div>

            {isEditing ?
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        className='p-1 mb-6 shadow-lg bg-white appearance-none rounded w-full'
                        disabled={isSubmitting}
                        {...form.register('file')}
                        multiple
                        type="file"
                        id='file'
                    />
                </form> : <div className='space-y-2'>
                    {attachments.map((attachment, index) => (
                        <div key={index} className='flex items-center px-3 w-full bg-sky-100 border-sky-200 border rounded-md hover:bg-sky-300'>
                            <a className='w-full py-3' href={attachment.url} rel='noreferrer'>{attachment.name}</a>
                        </div>
                    ))}
                </div>}
        </div>
    )
}

export default AttachmentsForm