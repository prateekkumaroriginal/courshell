import React from 'react'
import CourseSidebarItem from '@/components/User/CourseSidebarItem'

const CourseSidebarGroup = ({ id, label, courseId, enrolled, articles }) => {
    return (
        <div className=''>
            <h2 className='pl-4'>
                {label}
            </h2>

            {articles.map(article => (
                <CourseSidebarItem
                    key={article.id}
                    id={article.id}
                    label={article.title}
                    moduleId={id}
                    courseId={courseId}
                    isLocked={!article.isFree && !enrolled}
                    isCompleted={!!article.userProgress?.[0]?.isCompleted}
                />
            ))}
        </div>
    )
}

export default CourseSidebarGroup