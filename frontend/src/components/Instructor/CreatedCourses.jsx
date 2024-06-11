import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/ui/DataTable'
import { columns } from '../ui/columns'
import toast from 'react-hot-toast'
import { VITE_APP_BACKEND_URL } from '@/constants'
import ToastProvider from '../ui/ToastProvider'

const CreatedCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className='p-6'>
            <ToastProvider />
            <div className='mb-8'>
                <DataTable columns={columns} data={courses} />
            </div>
        </div>
    )
}

export default CreatedCourses