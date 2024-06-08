import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { VITE_APP_BACKEND_URL } from '@/constants'
import NavbarItem from '@/components/common/NavbarItem';

const Navbar = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/me`, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.error) {
                return setUserData(null);
            }
            if (data) {
                setUserData(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    const routes = [
        {
            label: "Browse",
            href: "/browse"
        },
        {
            label: "Courses",
            href: "/instructor/courses"
        },
        {
            label: "Analytics",
            href: "/instructor/analytics"
        },
        {
            label: "Dashboard",
            href: "/dashboard"
        },
    ];

    return (
        <div className='sticky top-0 bg-opacity-80 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gray-200 px-4 py-2 flex w-full justify-between items-center shadow-md z-50'>
            <div>
                <Link
                    to={'/'}
                    className='text-purple-700 text-4xl font-[900]'
                >
                    Courshell
                </Link>
            </div>
            <div className='flex h-10'>
                {routes.map((route, index) => {
                    return (
                        <NavbarItem route={route} key={index} />
                    )
                })}
                {!isLoading && <NavbarItem route={
                    {
                        label: userData ? 'Logout' : 'Login',
                        href: userData ? '/' : '/signin'
                    }}
                />}
            </div>
        </div>
    )
}

export default Navbar