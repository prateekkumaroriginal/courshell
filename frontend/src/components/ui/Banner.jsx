import React from 'react'
import { AlertTriangle, CheckCircleIcon } from 'lucide-react'

const iconMap = {
    WARNING: AlertTriangle,
    SUCCESS: CheckCircleIcon
}

const styleMap = {
    WARNING: 'bg-yellow-200/75 text-primary',
    SUCCESS: 'bg-emerald-600 text-secondary'
}

const Banner = ({ label, variant }) => {
    const Icon = iconMap[variant || "WARNING"];

    return (
        <div className={`flex items-center py-4 justify-center ${styleMap[variant || "WARNING"]}`}>
            <div className='flex mx-auto gap-x-2'>
                <Icon className='h-6 w-6' />
                {label}
            </div>
        </div>
    )
}

export default Banner