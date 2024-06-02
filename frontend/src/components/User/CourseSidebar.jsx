import React from 'react'
import CourseSidebarGroup from '@/components/User/CourseSidebarGroup';
import { PanelRightClose } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const CourseSidebar = ({ course, enrollment, progressPercentage }) => {
    return (

        <div className='h-full flex flex-col overflow-y-auto'>
            <Sheet>
                <SheetTrigger className='p-2 rounded-md hover:bg-slate-400/25 transition'>
                    <PanelRightClose className='h-6 w-6' />
                </SheetTrigger>

                <SheetContent side="left" className='p-0 bg-white w-80 inset-y-0 top-14'>
                    <SheetHeader>
                        <SheetTitle>
                            <div className='px-8 py-4 mt-12 flex flex-col border-y'>
                                <h1 className='font-semibold'>
                                    {course.title}
                                </h1>
                            </div>
                        </SheetTitle>
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
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default CourseSidebar