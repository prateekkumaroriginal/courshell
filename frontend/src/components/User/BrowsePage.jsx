import { VITE_APP_BACKEND_URL } from '@/constants'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import queryString from 'query-string';
import Categories from '@/components/User/Categories';
import SearchInput from '@/components/User/SearchInput';
import CoursesGrid from '@/components/User/CoursesGrid';

const BrowsePage = () => {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const url = queryString.stringifyUrl({
            url: '',
            query: {
                title: searchParams.get("title"),
                categoryId: searchParams.get("categoryId")
            }
        }, { skipEmptyString: true, skipNull: true });
        fetchCourses(url);
    }, [searchParams]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/categories`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
            } else if (response.status === 401) {
                return navigate("/signin");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }, []);

    const fetchCourses = useCallback(async (url) => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/courses${url}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
            } else if (response.status === 401) {
                return navigate("/signin");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className='p-6'>
            <SearchInput setIsLoading={setIsLoading} />
            <Categories items={categories} isLoading={isLoading} setIsLoading={setIsLoading} />
            {isLoading ? <div className='text-center text-2xl text-muted-foreground mt-10'>
                Loading ...
            </div> : (
                courses.length > 0
                    ? <CoursesGrid items={courses} />
                    : <div className='text-center text-2xl text-muted-foreground mt-10'>
                        No Courses Found
                    </div>
            )}
        </div>
    )
}

export default BrowsePage