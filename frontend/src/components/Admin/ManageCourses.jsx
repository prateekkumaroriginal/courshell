import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../ui/DataTable';
import { columns } from './AdminCoursesColumns';

const ManageCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/admin/courses`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                const flattenedData = data.courses.map(course => {
                    const { _count, ...rest } = course;
                    return { ...rest, instructorEmail: course.instructor.email, enrolledCount: _count.enrolledUsers, requestedCount: _count.requestedUsers };
                });
                setCourses(flattenedData);
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

export default ManageCourses