import React, { useState } from 'react'
import CourseSidebarGroup from '@/components/User/CourseSidebarGroup';
import { PanelRightClose, Paperclip } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import AttachmentsSidebarItem from './AttachmentsSidebarItem';
import CourseProgress from './CourseProgress';

const CourseSidebar = ({ course, enrollment, progressPercentage }) => {
    const [trigger, setTrigger] = useState();

    return (
        <div className='h-full flex flex-col overflow-y-auto border-r border-slate-600/40'>
            <Sheet>
                <div className='flex flex-col p-1'>
                    <SheetTrigger>
                        <div
                            onClick={() => setTrigger("Articles")}
                            className='p-2 rounded-md hover:bg-slate-400/25 transition'
                        >
                            <PanelRightClose className='h-6 w-6' />
                        </div>

                        <div
                            onClick={() => setTrigger("Attachments")}
                            className='p-2 rounded-md hover:bg-slate-400/25 transition'
                        >
                            <Paperclip className='h-6 w-6' />
                        </div>
                    </SheetTrigger>
                </div>

                <SheetContent side="left" className='p-0 bg-white w-80 inset-y-0 top-14 h-screen overflow-auto'>
                    <SheetHeader>
                        <SheetTitle>
                            <div className='px-8 py-4 mt-12 flex flex-col border-y'>
                                <h1 className='font-semibold'>
                                    {course.title}
                                </h1>
                                {enrollment && <div>
                                    <CourseProgress
                                        value={progressPercentage}
                                    />
                                </div>}
                            </div>
                        </SheetTitle>
                    </SheetHeader>

                    <div className='absolute flex flex-col w-full pb-20'>
                        {trigger === 'Articles' && (
                            <div className='flex flex-col w-full'>
                                {course.modules.map(module => (
                                    <CourseSidebarGroup
                                        key={module.id}
                                        id={module.id}
                                        label={module.title}
                                        articles={module.articles}
                                        courseId={course.id}
                                        enrolled={!!enrollment}
                                    />
                                ))}
                            </div>
                        )}

                        {trigger === 'Attachments' && (
                            <div className='flex flex-col w-full'>
                                {enrollment && course.attachments.map(attachment => (
                                    <AttachmentsSidebarItem
                                        key={attachment.id}
                                        id={attachment.id}
                                        originalName={attachment.originalName}
                                        courseId={course.id}
                                        type={attachment.type}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default CourseSidebar