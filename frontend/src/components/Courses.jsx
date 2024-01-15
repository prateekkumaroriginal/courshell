import React from 'react'
import { useNavigate } from 'react-router-dom'

const Courses = () => {
    const navigate = useNavigate()

    return (
        <div className='p-6'>
            <button className='px-4 py-2 text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-600 rounded-md'
                onClick={() => {
                    navigate("/create")
                }}
            >
                New Course
            </button>
        </div>
    )
}

export default Courses