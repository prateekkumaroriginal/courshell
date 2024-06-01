import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Combobox } from '@/components/ui/combobox';
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';

const formSchema = z.object({
    categoryId: z.string().min(1)
});

const CategoryForm = ({ course, courseId, setCategoryId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [options, setOptions] = useState([]);
    const [category, setCategory] = useState();

    const toggleEdit = () => setIsEditing(current => !current);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: course
    }, []);
    const { handleSubmit, reset, control, formState: { isSubmitting, isValid } } = form;

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/categories`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                }
            });
            const data = await response.json();
            const arr = data.categories.map(option => ({
                label: option.name,
                value: option.id
            }));
            setCategory(arr.find(option => option.value === course.categoryId));
            setOptions(arr);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const onSubmit = async (values) => {
        console.log(values);
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
                setCategory(options?.find(option => option.value === values.categoryId));
                setCategoryId(options?.find(option => option.value === values.categoryId)?.value);
                toast.success("Course Category Updated");
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
                <p className='font-bold text-zinc-600 py-2'>Course Category</p>

                {isEditing ? <div className='flex gap-x-2'>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            toggleEdit()
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
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Combobox
                            options={options}
                            onChange={(value) => field.onChange(value)}
                        />
                    )}
                />
            </form> : <p className='text-md font-semibold mt-2 py-1'>
                {category?.label || "No Category"}
            </p>}
        </div>
    )
}

export default CategoryForm