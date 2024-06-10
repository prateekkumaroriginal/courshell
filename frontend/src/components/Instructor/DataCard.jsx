import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { formatPrice } from '@/lib/format'

const DataCard = ({ label, value, shouldFormat }) => {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                    {label}
                </CardTitle>
            </CardHeader>

            <CardContent className='text-2xl font-bold'>
                {shouldFormat ? formatPrice(value) : value}
            </CardContent>
        </Card>

    )
}

export default DataCard