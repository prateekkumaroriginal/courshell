import { VITE_APP_BACKEND_URL } from '@/constants';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CourseEnrollButton from '@/components/User/CourseEnrollButton';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Newspaper } from 'lucide-react';
import parse from "html-react-parser";
import { useLoader } from '@/hooks/useLoaderStore';
import toast from 'react-hot-toast';

const CoursePreview = ({ userRole }) => {
    const { courseId } = useParams();
    const [course, setCourse] = useState();
    const [enrollment, setEnrollment] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { setMainLoading } = useLoader();

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = async () => {
        setMainLoading(true);
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses/${courseId}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            console.log(data);
            setCourse(data.course);
            setEnrollment(data.enrollment);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong")
        } finally {
            setMainLoading(false);
        }
    }

    return (
        <>
            {isLoading ? <div className='text-center text-2xl text-muted-foreground mt-10'>
                Loading...
            </div> : (
                <div className='relative h-full z-40 my-10'>
                    <div className='px-20 flex flex-col items-center justify-center space-y-8'>
                        <div className="grid grid-cols-1 md:grid-cols-2 w-full py-4 px-8 gap-y-4 justify-between bg-slate-800">
                            <div className='flex flex-col text-white space-y-4'>
                                <div className="w-full relative rounded-md my-2">
                                    <img className='object-contain max-h-[400px]' src={course.coverImageUrl} alt="" />
                                </div>
                                <p className='font-semibold text-3xl'>
                                    {course.title}
                                </p>
                                <span className='text-sm'>
                                    Created by {" "}
                                    <span className='text-violet-400 cursor-pointer underline'>
                                        {course.instructor.email}
                                    </span>
                                </span>
                            </div>

                            <div className='flex items-center justify-end'>
                                <div className='flex flex-col md:items-center w-full md:w-auto space-y-4'>
                                    <span className='text-xl text-white'>
                                        {formatPrice(course.price)}
                                    </span>

                                    {enrollment ? <Button
                                        size="lg"
                                        variant="secondary"
                                        className='w-full md:w-auto text-xl px-8 py-4'
                                        onClick={() => {
                                            navigate(`/courses/${courseId}/${course.modules[0].id}/${course.modules[0].articles[0].id}`);
                                        }}
                                    >
                                        Go To Course
                                    </Button> : <CourseEnrollButton
                                        courseId={courseId}
                                        requested={course?.requestedUsers?.length}
                                        userRole={userRole}
                                    />}
                                </div>
                            </div>
                        </div>


                        <div className='flex flex-col w-full justify-start'>
                            <h1 className='text-3xl mb-4'>Course Content</h1>

                            <Accordion className='w-full md:w-3/5' type="multiple" collapsible>
                                {course.modules.map(module => (
                                    <AccordionItem value={module.id}>
                                        <AccordionTrigger>{module.title}</AccordionTrigger>
                                        <AccordionContent>
                                            {module.articles.map(article => (
                                                <div
                                                    key={article.id}
                                                    className={cn(
                                                        'flex items-center last:border-b-0 border-b border-slate-500',
                                                        article.isFree && 'text-violet-600 cursor-pointer hover:text-violet-700 hover:underline'
                                                    )}>
                                                    {article.isFree ? <Dialog>
                                                        <DialogTrigger className='flex flex-1 py-2'>
                                                            <Newspaper className='size-4 text-black mr-2' />
                                                            {article.title}
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    <h1 className='text-3xl text-center'>{article.title}</h1>
                                                                </DialogTitle>
                                                                <div className='pt-8'>
                                                                    {parse(article.content)}
                                                                </div>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog> : <div className='flex flex-1 py-2'>
                                                        <Newspaper className='size-4 text-black mr-2' />
                                                        {article.title}
                                                    </div>}
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CoursePreview