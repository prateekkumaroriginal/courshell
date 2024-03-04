import React, { useState, useEffect, useCallback } from "react";

function CategoryForm({ course, courseId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [options, setOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const toggleDropdown = () => setIsEditing(!isEditing);

    const handleSelect = async (option) => {
        setSelectedCategory(option.label);
        setIsEditing(false);
        try {
            await fetch(`http://localhost:3000/instructor/courses/${courseId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    categoryId: option.value
                })
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const getCategories = async () => {
        const response = await fetch("http://localhost:3000/categories", {
            method: 'GET'
        })
        const data = await response.json()
        const arr = []
        data.categories.map(option => {
            arr.push({ label: option.name, value: option._id });
        });
        setOptions(arr)
    }

    useEffect(() => {
        getCategories();
    }, [])

    useEffect(() => {
        if (course && course.categoryId) {
            const defaultCategory = options.find(option => option.value === course.categoryId);
            setSelectedCategory(defaultCategory ? defaultCategory.label : "");
        }
    });

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='relative mt-6 border bg-slate-200 rounded-md p-4'>
            <p className='font-bold text-zinc-600 py-3'>Course Category</p>
            <input
                type="text"
                id="category"
                autoComplete="off"
                className='p-1 shadow-lg appearance-none rounded w-full outline-none'
                placeholder="Search category..."
                value={selectedCategory}
                onClick={toggleDropdown}
                onChange={handleInputChange}
            />
            {isEditing && (
                <ul className="absolute top-full left-0 bg-white shadow-md w-full">
                    {filteredOptions.map((option) => (
                        <li
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CategoryForm;
