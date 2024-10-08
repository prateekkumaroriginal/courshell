import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import { VITE_APP_BACKEND_URL } from '@/constants';
import { useNavigate } from 'react-router-dom';

const CourseEnrollButton = ({ courseId, userRole }) => {
    const navigate = useNavigate();

    const onClick = async () => {
        if (!userRole) {
            return navigate("/");
        }

        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses/${courseId}/request`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <Button
            size="lg"
            variant="courshellGradient"
            className='w-full md:w-auto text-xl px-8 py-4'
            onClick={onClick}
        >
            Enroll
        </Button>
    )
}

export default CourseEnrollButton