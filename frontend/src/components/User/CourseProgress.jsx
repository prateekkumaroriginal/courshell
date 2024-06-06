import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const CourseProgress = ({ value }) => {
    const [isComplete, setIsComplete] = useState(value === 100 ? true : false);

    return (
        <div>
            <Progress
                className='mt-2 h-2 bg-slate-300/70'
                progressIndicatorClassname={cn(
                    'bg-sky-500',
                    isComplete && 'bg-emerald-500'
                )}
                value={value}
            />

            <p className={cn(
                'font-medium text-sm text-sky-700 mt-1',
                isComplete && 'text-emerald-700'
            )}>
                {Math.round(value)}% Complete
            </p>
        </div>
    )
}

export default CourseProgress