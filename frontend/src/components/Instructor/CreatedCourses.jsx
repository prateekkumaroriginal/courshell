import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { columns } from '../ui/columns'
import toast from 'react-hot-toast'
import { VITE_APP_BACKEND_URL } from '@/constants'
import { useLoader } from '@/hooks/useLoaderStore'

const CreatedCourses = () => {
    const [courses, setCourses] = useState([]);
    const { setMainLoading } = useLoader();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setMainLoading(true);
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
        } finally {
            setMainLoading(false);
        }
    }

    return (
        <div className='p-6'>
            <div className='mb-8'>
                <DataTable
                    createObject={{
                        label: "New Course",
                        link: "/instructor/create"
                    }}
                    columns={columns}
                    data={courses}
                    filterField="title"
                    filterFieldPlaceholder="Filter courses ..."
                />
            </div>
        </div>
    )
}

export default CreatedCourses