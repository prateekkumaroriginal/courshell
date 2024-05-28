import { VITE_APP_BACKEND_URL } from '@/constants'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Categories from '@/components/Categories';
import SearchInput from '@/components/SearchInput';

const SearchPage = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/categories`, {
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

    return (
        <div className='p-6'>
            <SearchInput />
            <Categories items={categories} />
        </div>
    )
}

export default SearchPage