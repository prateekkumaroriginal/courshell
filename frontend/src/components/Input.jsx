import React from 'react'

const Input = ({ type, name, label, register, defaultValue, className }) => {
    const placeholderMap = {
        text: "e.g. \"Full Stack\"",
        password: "••••••••",
        email: "johndoe@example.com",
        textarea: "Start Typing..."
    }

    return (
        <div>
            {label && <div className="block">
                <label className="text-gray-700 text-xl font-bold mr-4" htmlFor={name}>{label}</label>
            </div>}
            {(type !== "textarea") ? <input
                className={className || 'p-2 shadow-lg outline-none rounded w-full focus:ring-4 focus:ring-blue-600/40'}
                type={type}
                id={name}
                {...register(name)}
                placeholder={placeholderMap[type]}
                defaultValue={defaultValue || ""}
            /> : <textarea
                className={className || 'p-2 min-h-16 shadow-lg outline-none rounded w-full focus:ring-4 focus:ring-blue-600/40'}
                type={type}
                id={name}
                {...register(name)}
                placeholder={placeholderMap[type]}
                defaultValue={defaultValue || ""}
            ></textarea>}
        </div>
    )
}

export default Input