import React from 'react'

const colorMap = {
    default: 'sky',
    SUCCESS: 'emerald'
}

const InfoCard = ({ icon: Icon, label, numberOfItems, variant }) => {
    return (
        <div className='border rounded-md flex items-center gap-x-2 p-3'>
            <div className={`flex items-center gap-x-1 p-1.5 text-slate-500 rounded-full bg-${colorMap[variant || 'default']}-200/70`}>
                <Icon className={`text-${colorMap[variant || 'default']}-600 h-6 w-6`} />
            </div>
            <div>
                <p className='font-semibold'>
                    {label}
                </p>
                <p className='text-zinc-600 text-sm'>
                    {numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}
                </p>
            </div>
        </div>
    )
}

export default InfoCard