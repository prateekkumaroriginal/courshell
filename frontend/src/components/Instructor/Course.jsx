import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TitleForm from '@/components/Instructor/TitleForm';
import DescriptionForm from '@/components/Instructor/DescriptionForm';
import CategoryForm from '@/components/Instructor/CategoryForm';
import ModulesForm from '@/components/Instructor/ModulesForm';
import { VITE_APP_BACKEND_URL } from '@/constants';
import Banner from '@/components/ui/Banner';
import CourseActions from '@/components/Instructor/CourseActions';
import PriceForm from '@/components/Instructor/PriceForm';
import CoverImage from '@/components/Instructor/CoverImage';
import AttachmentsForm from '@/components/Instructor/AttachmentsForm';

const Course = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [completionText, setCompletionText] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isComplete, setIsComplete] = useState();
    const [isPublished, setIsPublished] = useState();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [price, setPrice] = useState();
    const [categoryId, setCategoryId] = useState('');
    const [modules, setModules] = useState([]);

    const updateCompletionStatus = (course) => {
        const requiredFields = [
            course.title,
            course.description,
            course.coverImage,
            course.price,
            course.categoryId,
            course.modules.some(module => module.articles.some(article => article.isPublished))
        ];

        const totalFields = requiredFields.length;
        const completedFields = requiredFields.filter(Boolean).length;
        setIsComplete(requiredFields.every(Boolean));
        setCompletionText(`${completedFields}/${totalFields}`);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const course = { title, description, coverImage, price, categoryId, modules }
        updateCompletionStatus(course);
    }, [title, description, coverImage, price, categoryId, modules]);

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

                setTitle(data.course.title);
                setDescription(data.course.description);
                setCoverImage(data.course.coverImage);
                setPrice(data.course.price);
                setCategoryId(data.course.categoryId);
                setModules(data.course.modules);

                setIsPublished(data.course.isPublished);
                updateCompletionStatus(data.course);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className='md:px-6 mb-10'>
            {!isLoading && !isPublished && <Banner
                label={"This course is unpublished. It will not be visible to the students."}
            />}

            <div className='flex items-center w-full gap-x-8 mt-6'>
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
                        <TitleForm title={title} setTitle={setTitle} courseId={courseId} />
                        <DescriptionForm description={description} setDescription={setDescription} courseId={courseId} />
                        <CategoryForm setCategoryId={setCategoryId} course={course} courseId={courseId} fetchData={fetchData} />
                        <CoverImage fetchData={fetchData} course={course} courseId={courseId} />
                    </>}
                </div>
                <div>
                    <div className='flex items-center mt-16'>
                        <h2 className='text-xl font-semibold'>Course Content</h2>
                    </div>
                    {!isLoading && <>
                        <ModulesForm modules={modules} setModules={setModules} course={course} courseId={courseId} fetchData={fetchData} />
                        <PriceForm price={price} setPrice={setPrice} courseId={courseId} />
                        <AttachmentsForm courseId={courseId} />
                    </>}
                </div>
            </div>
        </div>
    )
}

export default Course