import React from 'react'
import { Link } from 'react-router-dom'

const NavbarItem = ({ route }) => {
    return (
        <div className='flex'>
            <Link
                to={route.href}
                className='flex items-center font-semibold px-4 hover:bg-purple-900 hover:text-white hover:rounded-md'
            >
                {route.label}
            </Link>
        </div>
    )
}

export default NavbarItem