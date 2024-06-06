import { BookOpen } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/format'
import CourseProgress from './CourseProgress'

const CourseCard = ({ id, title, imageUrl, articlesLength, price, progress, category }) => {
    return (
        <Link to={`/courses/${id}`}>
            <div className="group hover:shadow-md hover:shadow-purple-300 transition overflow-hidden border rounded-lg p-3 h-full">
                <div className="w-full relative aspect-video rounded-md overflow-hidden">
                    <img src={imageUrl} alt="" />
                </div>

                <div className="flex flex-col pt-2">
                    <div className="text-lg font-medium transition line-clamp-2 group-hover:text-purple-700">
                        {title}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {category}
                    </p>

                    <div className='my-2 flex items-center gap-x-2 text-sm md:text-xs'>
                        <div className='flex items-center gap-x-1 p-1.5 text-slate-500 rounded-full bg-sky-200/70'>
                            <BookOpen className='text-sky-600 h-4 w-4' />
                        </div>
                        <span className='text-slate-500'>
                            {articlesLength} {articlesLength === 1 ? "Article" : "Articles"}
                        </span>
                    </div>

                    {progress !== null ? <div>
                        <CourseProgress
                            variant={progress === 100 ? "SUCCESS" : "default"}
                            value={progress}
                        />
                    </div> : <p className='text-md md:text-sm fomt-medium text-slate-700'>
                        {formatPrice(price)}
                    </p>}
                </div>
            </div>
        </Link>
    )
}

export default CourseCard