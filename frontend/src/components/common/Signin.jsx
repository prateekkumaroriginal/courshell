import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomInput from '@/components/ui/CustomInput';
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(64),
});

const Signin = ({ setUserRole }) => {
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "all",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { handleSubmit, register, formState: { isSubmitting, isValid, errors } } = form;

    const onSubmit = async (values) => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/login`, {
                method: 'POST',
                headers: values
            });

            if (response.ok) {
                toast.success("Login Successful");
                const data = await response.json();
                setUserRole(data.role);
                localStorage.setItem('token', data.token);
                return navigate(`/dashboard`);
            } else if (response.status === 401) {
                toast.error("Invalid Credentials");
            } else {
                toast.error("Something went wrong");
            }
        } catch (e) {
            console.log(e);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-8 mx-auto lg:py-0">
            <div className="w-full bg-blue-200 rounded-lg shadow-2xl mt-20 sm:max-w-md xl:p-0">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Login
                    </h1>

                    <form
                        className="gap-y-4 md:space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <CustomInput
                            errors={errors}
                            type="email"
                            name="email"
                            label="Email"
                            register={register}
                        />

                        <CustomInput
                            errors={errors}
                            type="password"
                            name="password"
                            label="Password"
                            register={register}
                        />

                        <button
                            type="submit"
                            className={`w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg px-5 py-2.5 text-center ${(!isValid || isSubmitting) && 'opacity-50 cursor-not-allowed hover:bg-blue-700'}`}
                            disabled={!isValid || isSubmitting}
                        >
                            Sign In
                        </button>

                        <div className="flex justify-center">
                            <Link
                                to="/signup"
                                className='text-sm text-blue-800 hover:underline'
                            >
                                Signup
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signin;
