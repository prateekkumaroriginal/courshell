import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VITE_APP_BACKEND_URL } from "@/constants";
import toast from "react-hot-toast";

const onClick = async (courseId, id, status, updateRequestStatus, setEnrollments) => {
    try {
        const response = await fetch(`${VITE_APP_BACKEND_URL}/admin/courses/${courseId}/requests/${id}`, {
            method: 'PATCH',
            headers: {
                authorization: `Bearer ${localStorage.getItem('token')}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                status
            })
        });

        if (response.status === 401) {
            return navigate("/signin");
        }

        if (response.ok) {
            const data = await response.json();
            if (data.enrollment) {
                const { user, ...rest } = data.enrollment;
                const enrollment = { ...rest, userEmail: user.email };
                setEnrollments(prevEnrollments => [...prevEnrollments, enrollment])
            }
            updateRequestStatus(id, status);
            toast.success("Request updated")
        } else {
            toast.error("Something went wrong");
        }
    } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
    }
}

export const columns = (courseId, updateRequestStatus, setEnrollments) => [
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
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            return (
                <div className="text-center font-medium">
                    {row.getValue("status")}
                </div>
            )
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
                        Request Time
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
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const { id, status } = row.original

            if (status === "PENDING") {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onClick(courseId, id, "ACCEPTED", updateRequestStatus, setEnrollments)}
                                className="cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Accept
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onClick(courseId, id, "REJECTED", updateRequestStatus, setEnrollments)}
                                className="cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        },
    },
]
