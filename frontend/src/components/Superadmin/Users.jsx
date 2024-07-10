import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { columns } from './UsersColumns';
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/superadmin/users`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                console.log(data);
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchUsers();
    }, []);

    return (
        <div className='p-6'>
            <DataTable
                createObject={{
                    label: "New User",
                    link: "/superadmin/users/add"
                }}
                columns={columns}
                data={users}
                filterField="email"
                filterFieldPlaceholder="Filter users ..."
            />
        </div>
    )
}

export default Users