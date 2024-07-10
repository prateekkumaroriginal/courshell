import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom'
import { DataTable } from '../ui/DataTable';
import { columns as enrollmentColumns } from './EnrollmentColumns';
import { columns as requestColumns } from './RequestColumns';

const ManageCourse = () => {
    const { courseId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState();
    const [enrollments, setEnrollments] = useState([]);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = useCallback(async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/admin/courses/${courseId}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 401) {
                return navigate("/signin")
            }

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setCourse(data.course);

                const flattenedEnrollments = data.course.enrolledUsers.map(enrollment => {
                    const { user, ...rest } = enrollment;
                    return { ...rest, userEmail: user.email };
                });

                const flattenedRequests = data.course.requestedUsers.map(request => {
                    const { user, ...rest } = request;
                    return { ...rest, userEmail: user.email };
                });

                setEnrollments(flattenedEnrollments);
                setRequests(flattenedRequests);
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false)
        }
    }, [courseId]);

    const updateRequestStatus = useCallback((requestId, newStatus) => {
        setRequests((prevRequests) =>
            prevRequests.map((request) =>
                request.id === requestId ? { ...request, status: newStatus } : request
            )
        );
    }, []);

    return (
        <div>
            <div className='md:px-6 mb-10'>
                {isLoading ? <div className='text-center text-2xl text-muted-foreground mt-10'>
                    Loading ...
                </div> : <>
                    <div className='flex flex-col w-fit mx-auto py-8 items-center'>
                        <h1 className='text-3xl'>
                            {course.title}
                        </h1>
                        <div className='flex w-full text-sm text-zinc-600 justify-end'>
                            By {course.instructor.email}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className="mt-10">
                            <h1 className='text-xl font-semibold'>
                                Enrollments
                            </h1>
                            <div>
                                <DataTable
                                    isCoursePage={false}
                                    columns={enrollmentColumns}
                                    data={enrollments}
                                    filterField="userEmail"
                                    filterFieldPlaceholder="Filter by Email ..."
                                />
                            </div>
                        </div>

                        <div className="mt-10">
                            <h1 className='text-xl font-semibold'>
                                Requests
                            </h1>
                            <div>
                                <DataTable
                                    isCoursePage={false}
                                    columns={requestColumns(courseId, updateRequestStatus, setEnrollments)}
                                    data={requests}
                                    filterField="userEmail"
                                    filterFieldPlaceholder="Filter by Email ..."
                                />
                            </div>
                        </div>
                    </div>
                </>}
            </div>
        </div>
    )
}

export default ManageCourse