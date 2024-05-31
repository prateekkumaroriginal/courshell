import React from 'react'
import { useNavigate } from 'react-router-dom'

const NavbarItem = ({ route }) => {
    const navigate = useNavigate()

    return (
        <div className='flex'>
            <button onClick={() => {
                navigate(route.href)
            }}
                className='flex items-center font-semibold px-4 hover:bg-purple-900 hover:text-white hover:rounded-md'>
                {route.label}
            </button>
        </div>
    )
}

export default NavbarItem