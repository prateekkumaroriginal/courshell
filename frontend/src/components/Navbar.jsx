import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavbarItem from './NavbarItem'

const Navbar = () => {
    const [userData, setUserData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:3000/instructor/me', {
            headers: {
                authorization: `Bearer ${token}`
            }
        }).then(resp => {
            resp.json().then(data => {
                if (data.error) {
                    return setUserData(null)
                }
                if (data) {
                    setUserData(data)
                }
            })
            setIsLoading(false)
        }).catch(err => {
            console.log(err);
            setIsLoading(false)
        })
    }, [])

    const routes = [
        {
            label: "Courses",
            href: "/courses"
        },
        {
            label: "Analytics",
            href: "/analytics"
        },
    ]
    return (
        <div className='bg-gray-200 px-4 py-2 flex justify-between items-center shadow-lg'>
            <div>
                <button onClick={() => {
                    navigate("/")
                }}
                    className='text-purple-700 text-4xl font-[900]'>Courshell</button>
            </div>
            <div className='flex h-10'>
                {routes.map(route => {
                    return (
                        <NavbarItem route={route} />
                    )
                })}
                <a
                    href='http://localhost:5174'
                    target='_blank'
                    className='flex items-center font-semibold px-4 hover:bg-purple-900 hover:text-white hover:rounded-md'
                >
                    User Site
                </a>
                {!isLoading && <>
                    <NavbarItem route={{
                        label: userData ? 'Logout' : 'Login',
                        href: userData ? '/' : '/signin'
                    }} />
                    {!userData && <NavbarItem route={{
                        label: 'Signup',
                        href: '/signup'
                    }} />}
                </>
                }
            </div>
        </div>
    )
}

export default Navbar