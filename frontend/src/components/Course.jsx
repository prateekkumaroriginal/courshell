import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TitleForm from './TitleForm';
import DescriptionForm from './DescriptionForm'
import UploadImage from './UploadImage';
import CategoryForm from './CategoryForm';
import PriceForm from './PriceForm';
import AttachmentsForm from './AttachmentsForm';

const Course = () => {
    const { courseId } = useParams();
    const navigate = useNavigate()
    const [course, setCourse] = useState(null);
    const [totalFields, setTotalFields] = useState(0)
    const [completedFields, setCompletedFields] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData();
    }, []);

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

            if (response.ok) {
                const data = await response.json();
                setCourse(data.course);
                const updatedRequiredFields = [
                    data.course.title,
                    data.course.description,
                    data.course.imageId,
                    data.course.price,
                    data.course.categoryId,
                ];

                setTotalFields(updatedRequiredFields.length);
                setCompletedFields(updatedRequiredFields.filter(Boolean).length);
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            setIsLoading(false)
        }
    };

    return (
        <div className='md:p-6'>
            <div className='flex items-center justify-between'>
                <div className="flex flex-col gap-y-2">
                    <h1 className='text-3xl font-semibold'>
                        Course Setup
                    </h1>
                    {!isLoading && <span className='text-sm text-zinc-600'>
                        Completed Fields ({completedFields}/{totalFields})
                    </span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className='flex items-center mt-16'>
                        <h2 className='text-xl font-semibold'>Customize Your Course</h2>
                    </div>
                    {!isLoading && <>
                        <TitleForm course={course} fetchData={fetchData} courseId={courseId} />
                        <DescriptionForm course={course} fetchData={fetchData} courseId={courseId} />
                        <CategoryForm course={course} fetchData={fetchData} courseId={courseId} />
                        <UploadImage course={course} fetchData={fetchData} courseId={courseId} />
                    </>
                    }
                </div>
                <div>
                    <div className='flex items-center mt-16'>
                        <h2 className='text-xl font-semibold'>Course Content</h2>
                    </div>
                    {!isLoading && <>
                        <PriceForm course={course} fetchData={fetchData} courseId={courseId} />
                        <AttachmentsForm course={course} fetchData={fetchData} courseId={courseId} />
                    </>}
                </div>
            </div>
        </div>
    )
}

export default Course