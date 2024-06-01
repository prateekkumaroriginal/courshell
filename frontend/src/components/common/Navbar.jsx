import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VITE_APP_BACKEND_URL } from '@/constants'
import NavbarItem from '@/components/common/NavbarItem';

const Navbar = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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
            label: "Courses",
            href: "/instructor/courses"
        },
        {
            label: "Analytics",
            href: "/analytics"
        },
    ];

    return (
        <div className='relative bg-gray-200 px-4 py-2 flex w-full justify-between items-center shadow-lg z-50'>
            <div>
                <button onClick={() => {
                    navigate("/")
                }}
                    className='text-purple-700 text-4xl font-[900]'>Courshell</button>
            </div>
            <div className='flex h-10'>
                {routes.map((route, index) => {
                    return (
                        <NavbarItem route={route} key={index} />
                    )
                })}
                <a
                    href='http://localhost:5174'
                    target='_blank'
                    className='flex items-center font-semibold px-4 hover:bg-purple-900 hover:text-white hover:rounded-md'
                >
                    User Site
                </a>
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