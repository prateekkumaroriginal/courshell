import React from 'react'

const Input = ({ type, name, label, register }) => {
    const placeholderMap = {
        text: "Full Stack",
        password: "••••••••",
        email: "johndoe@example.com",
    }

    return (
        <div className='mb-4'>
            <div className="block">
                <label className="text-gray-700 text-xl font-bold mr-4" htmlFor={name}>{label}</label>
            </div>
            <input className='p-2 shadow-lg outline-none rounded w-full focus:ring-4 focus:ring-blue-600/40'
                type={type}
                id={name}
                {...register(name)}
                placeholder={placeholderMap[type]}
            />
        </div>
    )
}

export default Input