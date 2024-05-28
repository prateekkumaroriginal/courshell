import React from 'react'
import {
    FaLaptopCode,
    FaCode,
    FaMusic,
    FaDumbbell,
    FaPaintBrush,
    FaUtensils,
    FaPlane,
    FaCamera,
    FaCog,
    FaDollarSign
} from 'react-icons/fa';
import CategoryItem from './CategoryItem';

const iconsMap = {
    "Computer Science": FaLaptopCode,
    "Development": FaCode,
    "Music": FaMusic,
    "Fitness": FaDumbbell,
    "Art": FaPaintBrush,
    "Cooking": FaUtensils,
    "Travel": FaPlane,
    "Photography": FaCamera,
    "Engineering": FaCog,
    "Finance": FaDollarSign
};

const Categories = ({ items }) => {
    return (
        <div className='flex items-center justify-center gap-x-2 overflow-x-auto pb-2'>
            {items.map(item => (
                <CategoryItem
                    key={item.id}
                    label={item.name}
                    icon={iconsMap[item.name]}
                    value={item.id}
                />
            ))}
        </div>
    )
}

export default Categories