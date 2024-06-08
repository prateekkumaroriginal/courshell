import React from 'react'
import CourseCard from '@/components/User/CourseCard'

const CoursesGrid = ({ items }) => {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:px-6 xl:grid-cols-4 gap-4'>
            {items.map(item => (
                <CourseCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    imageUrl={`data:image/jpeg;base64,${item.coverImage.data}`}
                    articlesLength={item.modules.reduce((acc, curr) => acc + curr.articles.length, 0)}
                    price={item.price}
                    progress={item.progress}
                    category={item.category.name}
                />
            ))}
        </div>
    )
}

export default CoursesGrid