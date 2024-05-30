import queryString from 'query-string';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const CategoryItem = ({ label, value, icon: Icon, setIsLoading }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pathname = location.pathname;

    const [isSelected, setIsSelected] = useState();
    const [currentTitle, setCurrentTitle] = useState();

    useEffect(() => {
        const currentCategoryId = searchParams.get("categoryId");
        const newTitle = searchParams.get("title");
        setCurrentTitle(newTitle);
        setIsSelected(currentCategoryId === value);
    }, [searchParams, value]);

    const onClick = () => {
        setIsLoading(true);
        const url = queryString.stringifyUrl({
            url: pathname,
            query: {
                title: currentTitle,
                categoryId: isSelected ? null : value
            }
        }, { skipEmptyString: true, skipNull: true });
        navigate(url);
    }

    return (
        <button
            className={`py-2 px-3 text-sm border ${isSelected ? 'border-purple-900' : 'border-slate-200'} rounded-full flex items-center gap-x-1 hover:border-purple-900 transition ${isSelected && 'bg-purple-200/40 text-purple-800'}`}
            type='button'
            onClick={onClick}
        >
            {Icon && <Icon size={20} />}
            <div className="truncate">
                {label}
            </div>
        </button>
    )
}

export default CategoryItem