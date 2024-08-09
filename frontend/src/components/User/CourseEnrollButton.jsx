import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import { VITE_APP_BACKEND_URL } from '@/constants';

const CourseEnrollButton = ({ courseId, price, requested }) => {
    const [localRequested, setLocalRequested] = useState(requested);

    const onClick = async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses/${courseId}/request`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok){
                const data = await response.json();
                setLocalRequested(localRequested => !localRequested);
                console.log(data);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <Button
            size="sm"
            className='w-full md:w-auto mt-8'
            onClick={onClick}
            disabled={localRequested ? true : false}
        >
            {localRequested ? "Requested" : <>Enroll</>}
        </Button>
    )
}

export default CourseEnrollButton