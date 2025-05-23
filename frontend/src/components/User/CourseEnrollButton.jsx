import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import { VITE_APP_BACKEND_URL } from '@/constants';
import { useNavigate } from 'react-router-dom';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            return resolve(true);
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const CourseEnrollButton = ({ courseId, userRole }) => {
    const navigate = useNavigate();

    const createOrder = async (courseId) => {
        try {
            const res = await fetch(`${VITE_APP_BACKEND_URL}/payment/create`, {
              method: 'POST',
              headers: {
                authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ courseId }),
            });
      
            if (!res.ok) throw new Error('Failed to create Razorpay order');
      
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(err);
            toast.error("Error creating payment order");
            return null;
        }
    }

    const openRazorpayCheckout = (order, user) => {
        const options = {
            key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: "INR",
            name: "Courshell",
            description: "Course Purchase",
            order_id: order.id,
            handler: (response) => {
                // Razorpay auto-triggers webhook on backend
                console.log("Payment Response: ", response);
                toast.success("Payment Successful! You're now enrolled in the course.");
                navigate(`/courses/${courseId}`);
                window.location.reload();
            },
            prefill: {
                name: user?.name || 'Yo Name',
                email: user?.email || 'Yo Email',
            },
            notes: {
                courseId: order.notes.courseId,
            },
            theme: {
                color: "#6366f1",
            },
        };
      
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };


    const onClick = async () => {
        if (!userRole) {
            return navigate("/");
        }

        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const order = await createOrder(courseId);
        if (order && order.razorpayOrder) {
            openRazorpayCheckout(order.razorpayOrder, {});
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