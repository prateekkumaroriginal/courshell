import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CustomInput from '../ui/CustomInput';
import toast from 'react-hot-toast';
import { VITE_APP_BACKEND_URL } from '@/constants';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';

const ROLES = ["USER", "INSTRUCTOR"];

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(64),
    confirmPassword: z.string().min(8).max(64),
    role: z.enum(ROLES)
}).refine(({ password, confirmPassword }) => password === confirmPassword);

const Signup = ({ setUserRole }) => {
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            role: ROLES[1]
        },
    });

    const { handleSubmit, register, formState: { isSubmitting, isValid } } = form;

    const onSubmit = async (values) => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/user`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password,
                    role: values.role
                })
            });

            if (response.ok) {
                toast.success("Signup Successful");
                const data = await response.json();
                setUserRole(data.role);
                localStorage.setItem('token', data.token);
                return navigate(`/dashboard`);
            } else if (response.status === 400) {
                const data = await response.json();
                let errorMessage = ``;
                data.message.issues.map(({ message }) => {
                    errorMessage += `${message}\n`;
                });
                toast.error(errorMessage);
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-8 lg:py-0">
            <div className="w-full bg-blue-200 rounded-lg shadow-2xl mt-20 max-w-3xl lg:mt-10 xl:p-0">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Signup
                    </h1>

                    <Form {...form}>
                        <form
                            className="space-y-4 md:space-y-6"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="grid grid-cols-2 gap-x-4">
                                <div className="flex flex-col gap-y-4">
                                    <CustomInput
                                        type="email"
                                        name="email"
                                        label="Email"
                                        register={register}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <div className='text-gray-700 text-xl font-bold w-max mr-4 -mb-2'>Role</div>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="p-2 shadow-lg outline-none rounded w-full focus:ring-4 focus:ring-blue-600/40 border-none">
                                                            <SelectValue placeholder="Select a Role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {ROLES.map(role => (
                                                            <SelectItem className='cursor-pointer' value={role}>{role}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-y-4">
                                    <CustomInput
                                        type="password"
                                        name="password"
                                        label="Password"
                                        register={register}
                                    />

                                    <CustomInput
                                        type="password"
                                        name="confirmPassword"
                                        label="ConfirmPassword"
                                        register={register}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg px-5 py-2.5 text-center ${(!isValid || isSubmitting) && 'opacity-50 cursor-not-allowed hover:bg-blue-700'}`}
                                disabled={!isValid || isSubmitting}
                            >
                                Signup
                            </button>

                            <div className="flex justify-center">
                                <Link
                                    to="/signin"
                                    className='text-sm text-blue-800 hover:underline'
                                >
                                    Login
                                </Link>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default Signup