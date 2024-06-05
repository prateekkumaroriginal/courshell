import React from 'react';
import { File } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SheetClose } from '@/components/ui/sheet';

const AttachmentsSidebarItem = ({ id, originalName, courseId }) => {
    const Icon = File;

    return (
        <SheetClose
            className='flex group w-full items-center gap-x-2 text-base font-medium pl-6 transition-all hover:bg-slate-300/30'
        >
            <Link
                to={`/courses/${courseId}/attachments/${id}`}
                target='_blank' className='flex items-center gap-x-2 py-2'
            >
                <Icon className='text-slate-600' />
                <span className='line-clamp-1 text-left'>
                    {originalName}
                </span>
            </Link>
        </SheetClose>
    )
}

export default AttachmentsSidebarItem