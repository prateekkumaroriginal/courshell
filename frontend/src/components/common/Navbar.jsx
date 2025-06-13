import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { VITE_APP_BACKEND_URL } from '@/constants'
import NavbarItem from '@/components/common/NavbarItem';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const Navbar = ({ userRole, setUserRole }) => {
    const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
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
                    return;
                }
                if (data) {
                    setUserRole(data.role);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, []);

    useEffect(() => {
        setRoutes([
            // (userRole === "SUPERADMIN") && {
            //     label: "Users",
            //     href: "/superadmin/users"
            // },
            (["SUPERADMIN", "ADMIN", "INSTRUCTOR"].includes(userRole)) && {
                label: "Courses",
                href: ["SUPERADMIN", "ADMIN"].includes(userRole) ? '/admin/courses' : '/instructor/courses'
            },
            // (["SUPERADMIN", "ADMIN", "INSTRUCTOR"].includes(userRole)) && {
            //     label: "Analytics",
            //     href: "/instructor/analytics"
            // },
            {
                label: "Browse",
                href: "/browse"
            },
            {
                label: "Dashboard",
                href: "/dashboard"
            },
        ]);
    }, [userRole]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        setUserRole();
        return navigate("/");
    }, []);

    return (
        <div className='sticky top-0 bg-opacity-80 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gray-200 px-4 py-2 flex w-full justify-between items-center shadow-md z-50 h-14'>
            <div>
                <Link
                    to={'/'}
                    className='text-purple-700 text-4xl font-[Audiowide]'
                >
                    COURSHELL
                </Link>
            </div>
            <div className='flex items-center'>
                {routes.map((route, index) => {
                    if (!route) return null;
                    return (
                        <NavbarItem route={route} key={index} />
                    )
                })}

                {!isLoading && (
                    userRole ? (
                        <>
                            <Popover>
                                <PopoverTrigger className='ml-4'>
                                    <div className='rounded-full border-2 border-black'>
                                        <Avatar>
                                            <AvatarImage src="shttps://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/d9/fa/1b/lost-valley.jpg?w=2000&h=-1&s=1" />
                                            <AvatarFallback>PK</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent asChild>
                                    <div className="absolute -right-4 top-2 flex flex-col gap-y-2 pt-2 items-center w-40 min-w-max border border-black shadow-xl">
                                        <span className='border-b border-black w-full text-center text-xs'>Prateek Kumar</span>
                                        <div className='px-2 text-violet-700 cursor-pointer'>
                                            My Profile
                                        </div>
                                        <div
                                            onClick={handleLogout}
                                            className='flex items-center font-semibold px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-600/90 text-white rounded-md'
                                        >
                                            Logout
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>
                    ) : (
                        <NavbarItem route={
                            {
                                label: 'Login',
                                href: '/signin'
                            }}
                        />
                    )
                )}
            </div>
        </div>
    )
}

export default Navbar