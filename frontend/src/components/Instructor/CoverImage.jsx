import { VITE_APP_BACKEND_URL } from '@/constants'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast';
import { UploadDropzone } from '@/lib/uploadthing';
import { Button } from '../ui/button';

const CoverImage = ({ course, courseId, fetchData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [coverImageUrl, setCoverImageUrl] = useState(course.coverImageUrl);

    const form = useForm({
        defaultValues: {
            coverImageUrl: coverImageUrl || ''
        },
        mode: 'onChange'
    });

    const { handleSubmit, reset, watch, formState: { isSubmitting } } = form;

    const currentImageUrl = watch('coverImageUrl');

    const onSubmit = async (values) => {
        const updatingToast = toast.loading("Updating...");
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(values)
            });

            if (response.ok) {
                toast.success("Cover Image Updated");
                setCoverImageUrl(values.coverImageUrl);
                fetchData();
            } else {
                toast.error("Something went wrong");
                reset();
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error while uploading image:', error);
            toast.error("Something went wrong");
            reset();
        } finally {
            toast.dismiss(updatingToast);
        }
    }

    return (
        <div className='relative mt-6 border bg-slate-200 rounded-md p-4'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex items-center justify-between pb-2">
                    <p className='font-bold text-zinc-600'>Course Cover Image</p>
                    {isEditing && (
                        <div className='flex gap-2'>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setIsEditing(false);
                                    form.setValue('coverImageUrl', coverImageUrl);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                disabled={isSubmitting || !currentImageUrl}
                                variant="default"
                            >
                                Save
                            </Button>
                        </div>
                    )}

                    {!isEditing && currentImageUrl && (
                        <div className='flex gap-2'>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setIsEditing(true);
                                    form.setValue("coverImageUrl", "");
                                }}
                            >
                                Remove
                            </Button>
                            {coverImageUrl !== currentImageUrl && (
                                <Button
                                    type='submit'
                                    disabled={isSubmitting || !currentImageUrl}
                                    variant="default"
                                >
                                    Save
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {!currentImageUrl && (
                    <UploadDropzone
                        endpoint="coverImage"
                        onClientUploadComplete={(res) => {
                            form.setValue('coverImageUrl', res[0].ufsUrl);
                        }}
                        onUploadError={(err) => {
                            console.log(err);
                            toast.error("Failed to upload image!");
                        }}
                    />
                )}
            </form>
            {currentImageUrl && <img className='rounded-md' src={currentImageUrl} alt="Image Preview" />}
        </div>
    )
}

export default CoverImage