import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns = [
    {
        accessorKey: "userEmail",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        User
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
    {
        accessorKey: "progress",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Progress
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            return <div className="text-center font-medium">{parseInt(row.getValue("progress"))}%</div>
        }
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Started
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const time = new Date(row.getValue("createdAt"));
            const formattedTime = time.toLocaleTimeString();
            const formattedDate = time.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            return (
                <div className="text-center font-medium">
                    <div>
                        {formattedTime}
                    </div>
                    <div className="border-b border-slate-600/60 max-w-20 mx-auto"></div>
                    <div>
                        {formattedDate}
                    </div>
                </div>
            )
        }
    }
]
