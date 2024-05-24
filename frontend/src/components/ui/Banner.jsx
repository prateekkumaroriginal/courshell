import React from 'react'
import { AlertTriangle, CheckCircleIcon } from 'lucide-react'

const iconMap = {
    WARNING: AlertTriangle,
    SUCCESS: CheckCircleIcon
}

const styleMap = {
    WARNING: 'bg-yellow-200/75 border-yellow-30 text-primary',
    SUCCESS: 'bg-emerald-700 border-emerald-800 text-secondary'
}

const Banner = ({ label, variant }) => {
    const Icon = iconMap[variant || "WARNING"];

    return (
        <div className={`flex items-center py-4 mb-2 md:-mt-6 md:-mx-6 ${styleMap[variant || "WARNING"]}`}>
            <div className='flex mx-auto gap-x-2'>
                <Icon className='h-6 w-6' />
                {label}
            </div>
        </div>
    )
}

export default Banner