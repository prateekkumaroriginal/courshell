import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TitleForm from './TitleForm';
import DescriptionForm from './DescriptionForm'

const Course = () => {
    const { courseId } = useParams();
    const navigate = useNavigate()
    const [course, setCourse] = useState(null);
    const [requiredFields, setRequiredFields] = useState([])
    const [totalFields, setTotalFields] = useState(0)
    const [completedFields, setCompletedFields] = useState(0)
    const [completionText, setCompletionText] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:3000/instructor/courses/${courseId}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 401) {
                return navigate("/signin")
            }

            if (!response.ok) {
                throw new Error('Failed to fetch course data');
            }

            const data = await response.json();
            setCourse(data.course);
            setRequiredFields([
                data.course.title,
                data.course.description,
                data.course.imageLink,
                data.course.price,
            ]);

            setTotalFields(requiredFields.length);
            setCompletedFields(requiredFields.filter(Boolean).length);
            setCompletionText(`${completedFields}/${totalFields}`);
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching course data:', error);
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchData();
    }, [requiredFields]);


    return (
        <div className='md:p-6'>
            <div className='flex items-center justify-between'>
                <div className="flex flex-col gap-y-2">
                    <h1 className='text-3xl font-semibold'>
                        Course Setup
                    </h1>
                    <span className='text-sm text-zinc-600'>
                        Completed Fields ({completionText})
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-xl font-semibold'>Customize Your Course</h2>
                    </div>
                    {!isLoading && <>
                        <TitleForm course={course} courseId={courseId} />
                        <DescriptionForm course={course} courseId={courseId} />
                    </>
                    }
                </div>
            </div>
        </div>
    )
}

export default Course