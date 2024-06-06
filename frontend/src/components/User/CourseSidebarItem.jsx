import React from 'react';
import { CircleCheck, Lock, Newspaper } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SheetClose } from '@/components/ui/sheet';

const CourseSidebarItem = ({ id, label, courseId, isLocked, isCompleted }) => {
    const pathname = useLocation().pathname;
    const navigate = useNavigate();
    const Icon = isLocked ? Lock : (isCompleted ? CircleCheck : Newspaper);
    const isActive = pathname?.includes(id);

    const onClick = () => {
        navigate(`/courses/${courseId}/${id}`);
    }

    return (
        <SheetClose
            className={cn(
                'flex group w-full items-center gap-x-2 text-base font-medium pl-6 transition-all hover:bg-slate-300/30',
                isActive && ' bg-slate-400/30',
                isCompleted && 'text-emerald-700 hover:text-emerald-700',
                isActive && isCompleted && 'bg-emerald-200/20'
            )}
            onClick={onClick}
        >
            <div className={cn(
                'flex items-center gap-x-2 py-2',
                isCompleted && 'text-emerald-700'
            )}>
                <Icon className={cn(
                    'text-slate-600',
                    isActive && 'text-slate-800',
                    isCompleted && 'text-emerald-700'
                )} />
                <span className='line-clamp-1 text-left'>
                    {label}
                </span>
            </div>
        </SheetClose>
    )
}

export default CourseSidebarItem