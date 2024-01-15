import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Signin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleClick = () => {
        fetch('http://localhost:3000/instructor/login', {
            method: 'POST',
            headers: {
                email,
                password
            }
        }).then(resp => {
            resp.json().then(data => {
                if (data.message) {
                    alert(data.message)
                }
                if (data.token) {
                    localStorage.setItem('token', data.token)
                    navigate('/dashboard')
                }
            })
        })
    }
    return (
        <div className='container p-5 flex justify-center'>
            <div className='bg-green-200 shadow-2xl m-10 rounded p-10 w-2/5'>
                <div className='mb-4'>
                    <label className="text-gray-700 text-xl font-bold mr-4" htmlFor="email">Email</label>
                    <input className='p-1 shadow-lg appearance-none rounded w-3/5' type="email" id='email' onChange={e => setEmail(e.target.value)} />
                </div>
                <div className='mb-4'>
                    <label className="text-gray-700 text-xl font-bold mr-4" htmlFor="password">Password</label>
                    <input className='p-1 shadow-lg appearance-none rounded w-3/5' type="password" id='password' onChange={e => setPassword(e.target.value)} />
                </div>
                <div className='flex justify-center py-3'>
                    <button className='text-white bg-green-800 px-5 py-2 rounded hover:bg-green-900' onClick={handleClick}>Sign In</button>
                </div>
            </div>
        </div>
    )
}

export default Signin