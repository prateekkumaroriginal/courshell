import NavbarItem from '@/components/common/NavbarItem';
import { VITE_APP_BACKEND_URL } from '@/constants';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ userRole, setUserRole }) => {
    const [routes, setRoutes] = useState([]);
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

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        setRoutes([
            (userRole === "SUPERADMIN") && {
                label: "Users",
                href: "/superadmin/users"
            },
            (["SUPERADMIN", "ADMIN", "INSTRUCTOR"].includes(userRole)) && {
                label: "Courses",
                href: ["SUPERADMIN", "ADMIN"].includes(userRole) ? '/admin/courses' : '/instructor/courses'
            },
            (["SUPERADMIN", "ADMIN", "INSTRUCTOR"].includes(userRole)) && {
                label: "Analytics",
                href: "/instructor/analytics"
            },
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
                    if (!route) return null;
                    return (
                        <NavbarItem route={route} key={index} />
                    )
                })}
                {!isLoading && !userRole && <NavbarItem route={
                    {
                        label: 'Login',
                        href: '/signin'
                    }}
                />}
                {!isLoading && userRole && <div className='flex'>
                    <div
                        onClick={handleLogout}
                        className='flex items-center font-semibold px-4 cursor-pointer hover:bg-purple-900 hover:text-white hover:rounded-md'
                    >
                        Logout
                    </div>
                </div>}
            </div>
        </div>
    )
}

export default Navbar