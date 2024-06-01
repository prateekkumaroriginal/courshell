import React from 'react';
import { CircleCheck, Lock, Newspaper } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CourseSidebarItem = ({ id, label, moduleId, courseId, isLocked, isCompleted }) => {
    const pathname = useLocation().pathname;
    const navigate = useNavigate();
    const Icon = isLocked ? Lock : (isCompleted ? CircleCheck : Newspaper);
    const isActive = pathname?.includes(id);

    const onClick = () => {
        if (isLocked) {
            return;
        }
        navigate(`/courses/${courseId}/${moduleId}/${id}`);
    }

    return (
        <button
            type='button'
            onClick={onClick}
            className={cn(
                'flex group w-full items-center gap-x-2 text-base font-medium pl-6 transition-all hover:bg-slate-300/30',
                isActive && ' bg-slate-400/30',
                isCompleted && 'text-emerald-700 hover:text-emerald-700',
                isActive && isCompleted && 'bg-emerald-200/20'
            )}
        >
            <div className={cn(
                'flex items-center gap-x-2 py-2',
                isActive && 'text-slate-700',
                isCompleted && 'text-emerald-700'
            )}>
                <Icon className={cn(
                    'text-slate-600',
                    isActive && 'text-slate-800',
                    isCompleted && 'text-emerald-700'
                )} />
                {label}
            </div>
        </button>
    )
}

export default CourseSidebarItem