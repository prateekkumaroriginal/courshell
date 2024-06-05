import React, { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import CustomInput from '@/components/ui/CustomInput';
import toast from 'react-hot-toast';
import { VITE_APP_BACKEND_URL } from '@/constants';
import { formatPrice } from '@/lib/format';

const priceSchema = z.object({
    price: z.coerce.number().multipleOf(0.01)
});

const PriceForm = ({ courseId, price, setPrice }) => {
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm({
        resolver: zodResolver(priceSchema),
        defaultValues: {
            price
        }
    }, [price]);

    const { handleSubmit, reset, register, formState: { isSubmitting, isValid } } = form;

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
                setPrice(values.price);
                toast.success("Course Price Updated");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className='mt-6 border bg-slate-200 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                <p className='font-bold text-zinc-600 py-2'>Course Price</p>

                {isEditing ? <div className='flex gap-x-2'>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={() => {
                            setIsEditing(false)
                            reset(form)
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
                    className='p-1 shadow-lg appearance-none rounded w-full outline-none focus:ring-4 focus:ring-blue-600/40'
                    defaultValue={price}
                    name={'price'}
                    placeholder={"Enter course selling price..."}
                    type={'number'}
                    register={register}
                />
            </form> : <p className='text-md font-semibold mt-2 py-1'>
                <span className={`${!price && 'italic text-zinc-600'}`}>
                    {formatPrice(price) || "Not set"}
                </span>
            </p>}
        </div>
    )
}

export default PriceForm