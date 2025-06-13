import React from 'react'
import { Link } from 'react-router-dom'

const NavbarItem = ({ route }) => {
    return (
        <Link
            to={route.href}
            className='flex items-center font-semibold px-4 py-2 h-fit hover:bg-purple-900 hover:text-white hover:rounded-md'
        >
            {route.label}
        </Link>
    )
}

export default NavbarItem