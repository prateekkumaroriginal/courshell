import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TitleForm from '@/components/TitleForm';
import DescriptionForm from '@/components/DescriptionForm';
import CategoryForm from '@/components/CategoryForm';
import ToastProvider from '@/components/ui/ToastProvider';
import ModulesForm from '@/components/ModulesForm';
import { VITE_APP_BACKEND_URL } from '@/constants';
import Banner from '@/components/ui/Banner';
import CourseActions from '@/components/CourseActions';
import PriceForm from '@/components/PriceForm';
import CoverImage from '@/components/CoverImage';
// import DescriptionForm from './DescriptionForm'
// import UploadImage from './UploadImage';
// import CategoryForm from './CategoryForm';
// import PriceForm from './PriceForm';
// import AttachmentsForm from './AttachmentsForm';

const Course = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [completionText, setCompletionText] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isComplete, setIsComplete] = useState();
    const [isPublished, setIsPublished] = useState();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}`, {
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
                setIsPublished(data.course.isPublished);
                const requiredFields = [
                    data.course.title,
                    data.course.description,
                    data.course.coverImageId,
                    data.course.price,
                    data.course.categoryId,
                    data.course.modules.some(module => module.articles.some(article => article.isPublished))
                ];

                const totalFields = requiredFields.length;
                const completedFields = requiredFields.filter(Boolean).length;

                setCompletionText(`${completedFields}/${totalFields}`);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className='md:p-6'>
            <ToastProvider />
            {!isLoading && !isPublished && <Banner
                label={"This course is unpublished. It will not be visible to the students."}
            />}

            <div className='flex items-center w-full gap-x-8'>
                <div className="flex flex-col">
                    <h1 className='text-3xl font-semibold'>
                        Course Settings
                    </h1>
                    {!isLoading && <span className='text-sm text-zinc-600'>
                        Completed Fields ({completionText})
                    </span>}
                </div>

                {!isLoading && <CourseActions
                    disabled={!isComplete}
                    courseId={courseId}
                    isPublished={isPublished}
                    setIsPublished={setIsPublished}
                />}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className='flex items-center mt-16'>
                        <h2 className='text-xl font-semibold'>Customize Your Course</h2>
                    </div>
                    {!isLoading && <>
                        <TitleForm course={course} courseId={courseId} />
                        <DescriptionForm course={course} courseId={courseId} />
                        <CategoryForm course={course} courseId={courseId} />
                        <CoverImage course={course} fetchData={fetchData} courseId={courseId} />
                    </>}
                </div>
                <div>
                    <div className='flex items-center mt-16'>
                        <h2 className='text-xl font-semibold'>Course Content</h2>
                    </div>
                    {!isLoading && <>
                        <ModulesForm course={course} courseId={courseId} fetchData={fetchData} />
                        <PriceForm course={course} courseId={courseId} />
                        {/* <AttachmentsForm course={course} courseId={courseId} /> */}
                    </>}
                </div>
            </div>
        </div>
    )
}

export default Course