import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import InfoCard from './InfoCard';
import { CheckCircle, Clock } from 'lucide-react';
import CoursesGrid from './CoursesGrid';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [coursesInProgress, setCoursesInProgress] = useState([]);
    const [requestedCourses, setRequestedCourses] = useState([]);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/dashboard`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const tempCompletedCourses = [];
                const tempCoursesInProgress = [];
                data.user.enrolledCourses.map(course => {
                    if (course.progress === 100) {
                        tempCompletedCourses.push(course);
                    } else {
                        tempCoursesInProgress.push(course)
                    }
                });
                setCompletedCourses(tempCompletedCourses);
                setCoursesInProgress(tempCoursesInProgress);
                setRequestedCourses(data.user.requestedCourses);
            } else if (response.status === 401) {
                return navigate('/signin');
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className='p-6 space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <InfoCard
                    icon={Clock}
                    label="In Progress"
                    numberOfItems={coursesInProgress.length}
                />
                <InfoCard
                    icon={CheckCircle}
                    label="Completed"
                    numberOfItems={completedCourses.length}
                    variant={"SUCCESS"}
                />
            </div>

            {[...coursesInProgress, ...completedCourses].length > 0 && <>
                <div className="text-3xl pt-4 text-center">
                    My Courses
                </div>
                <CoursesGrid items={[...coursesInProgress, ...completedCourses]} />
            </>}

            {requestedCourses.length > 0 && <>
                <div className="text-3xl pt-4 text-center">
                    Requested Courses
                </div>
                <CoursesGrid items={requestedCourses} />
            </>}
        </div>
    )
}

export default Dashboard