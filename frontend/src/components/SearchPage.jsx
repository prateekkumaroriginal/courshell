import { VITE_APP_BACKEND_URL } from '@/constants'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Categories from '@/components/Categories';
import SearchInput from '@/components/SearchInput';
import { useSearchParams } from 'react-router-dom';
import queryString from 'query-string';
import CoursesGrid from '@/components/CoursesGrid';

const SearchPage = () => {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
            const response = await fetch(`${VITE_APP_BACKEND_URL}/categories`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
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
            const response = await fetch(`${VITE_APP_BACKEND_URL}/browse${url}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
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
            </div> : <CoursesGrid items={courses} />}
        </div>
    )
}

export default SearchPage