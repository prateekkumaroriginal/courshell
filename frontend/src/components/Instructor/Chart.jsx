import React from 'react'
import { Card } from '../ui/card'
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts'

const Chart = ({ data }) => {
    return (
        <Card>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    <XAxis
                        dataKey="title"
                        stroke='#888888'
                        fontSize={12}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke='#888888'
                        fontSize={12}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Bar
                        dataKey="total"
                        fill='#0369a1'
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}

export default Chart