import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import DataCard from './DataCard';
import Chart from './Chart';

const Analytics = () => {
    const [totalEnrollments, setTotalEnrollments] = useState();
    const [totalRevenue, setTotalRevenue] = useState();
    const [coursesData, setCoursesData] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/analytics`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTotalEnrollments(data.totalEnrollments);
                setTotalRevenue(data.totalRevenue);
                setCoursesData(data.data);
            } else if (response.status === 401) {
                navigate('/signin');
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

    if (isLoading) {
        return <div className='text-center text-2xl text-muted-foreground mt-10'>
            Loading ...
        </div>
    }

    return (
        <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <DataCard
                    label='Total Revenue'
                    value={totalRevenue}
                    shouldFormat={true}
                />
                <DataCard
                    label='Total Enrollments'
                    value={totalEnrollments}
                />
                <Chart data={coursesData} />
            </div>
        </div>
    )
}

export default Analytics