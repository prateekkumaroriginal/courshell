import React, { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import queryString from 'query-string'

const SearchInput = ({ setIsLoading }) => {
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value);
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const url = queryString.stringifyUrl({
            url: pathname,
            query: {
                title: debouncedValue,
                categoryId: searchParams.get("categoryId")
            }
        }, { skipEmptyString: true, skipNull: true });
        navigate(url);
        setIsLoading(true);
    }, [debouncedValue, searchParams]);

    return (
        <div className="flex justify-center mb-4">
            <div className='relative'>
                <Search className='h-4 w-4 absolute top-3 left-3 text-slate-600' />
                <Input
                    className='w-full md:w-[600px] pl-10 rounded-full focus:bg-slate-200/50'
                    placeholder='Search for a course...'
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
        </div>
    )
}

export default SearchInput