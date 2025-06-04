import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react'
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
import { toTitleCase } from '@/lib/format';

const ROLES = ["USER", "INSTRUCTOR"];
const BUSINESS_TYPES = [
    "llp",
    "ngo",
    "other",
    "individual",
    "partnership",
    "proprietorship",
    "public_limited",
    "private_limited",
    "trust",
    "society",
    "not_yet_registered",
    "educational_institutes"
];

const formSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(64),
    password: z.string().min(8).max(64),
    confirmPassword: z.string().min(8).max(64),
    role: z.enum(ROLES),
    phone: z.string().min(10, "Phone number must be of 10 digits").optional(),
    address: z.object({
        street1: z.string().min(1, "Street 1 is required").max(100, "Street Line 1 cannot exceed 100 characters"),
        street2: z.string().min(1, "Street 2 is required").max(100, "Street Line 2 cannot exceed 100 characters"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        postal_code: z.string().min(1, "Zip code is required")
    }).optional(),
    legal_business_name: z.string().min(4, "Legal business name must be at least 4 characters").max(200, "Legal business name must be at most 200 characters").optional(),
    business_type: z.enum(BUSINESS_TYPES).optional(),
    razorpayPayload: z.object({
        // bankAccount: z.object({
        //     accountNumber: z.string().min(1, "Account number is required"),
        //     ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
        //     beneficiaryName: z.string().min(1, "Beneficiary name is required")
        // }),
        kyc: z.object({
            pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
            gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format").optional().nullable()
        }),
    }).optional()
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
}).refine(
    ({ role, phone, address, business_type, legal_business_name, razorpayPayload }) => {
        if (role === "INSTRUCTOR") {
            return !!phone && !!address && !!business_type && !!legal_business_name && !!razorpayPayload?.kyc.pan;
        }
        return true;
    },
    {
        message: "Phone, address, business type, legal business name, and PAN are required for instructors",
        path: ["phone", "address", "business_type", "legal_business_name", "razorpayPayload"],
    }
);

const Signup = ({ setUserRole }) => {
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "all",
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
            role: ROLES[0]
        },
    });

    // const debugValidation = async () => {
    //     const result = await form.trigger();
    //     console.log('Manual validation result:', result);
    //     console.log('Current errors:', form.formState.errors);

    //     // Test the schema directly
    //     try {
    //         const values = watch();
    //         const validated = formSchema.parse(values);
    //         console.log('Schema validation passed:', validated);
    //     } catch (error) {
    //         console.log('Schema validation failed:', error.errors);
    //     }
    // };

    const {
        handleSubmit,
        register,
        watch,
        control,
        formState: { isSubmitting, isValid, errors }
    } = form;
    const selectedRole = watch("role");

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'role' && value.role === ROLES[0]) {
                form.setValue('phone', undefined);
                form.setValue('address', undefined);
                form.setValue('legal_business_name', undefined);
                form.setValue('business_type', undefined);
                form.setValue('razorpayPayload', undefined);
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, form]);

    const onSubmit = async (values) => {
        try {
            const { confirmPassword, ...payload } = values;

            const response = await fetch(`${VITE_APP_BACKEND_URL}/user/signup`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Signup Successful");
                const data = await response.json();
                setUserRole(data.role);
                localStorage.setItem('token', data.token);
                return navigate(`/dashboard`);
            } else if (response.status === 400) {
                const data = await response.json();
                const errorMessage = data.message?.issues?.map(({ message }) => message).join("\n") || "Invalid input data";
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
                    <Form {...form}>
                        <form
                            className="space-y-4 md:space-y-6"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            {/* <button type="button" onClick={debugValidation} className="bg-red-500 text-white p-2">
                                Debug Validation
                            </button> */}
                            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Signup
                            </h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    errors={errors}
                                    type="email"
                                    name="email"
                                    label="Email"
                                    register={register}
                                />

                                <CustomInput
                                    errors={errors}
                                    type="text"
                                    name="name"
                                    label="Name"
                                    placeholder="Enter Your Name"
                                    register={register}
                                />

                                <CustomInput
                                    errors={errors}
                                    type="password"
                                    name="password"
                                    label="Password"
                                    register={register}
                                />

                                <CustomInput
                                    errors={errors}
                                    type="password"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    register={register}
                                />

                                <FormField
                                    control={control}
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


                            {selectedRole === "INSTRUCTOR" && (
                                <>
                                    <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                        Additional Details (Required for Instructor)
                                    </h1>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="legal_business_name"
                                                label="Legal Business Name"
                                                placeholder="Enter Legal Business Name..."
                                                register={register}
                                            />
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="phone"
                                                label="Phone Number"
                                                placeholder="Enter Phone Number..."
                                                register={register}
                                            />
                                            {/* <CustomInput
                                            errors={errors}
                                                type="text"
                                                name="razorpayPayload.bankAccount.accountNumber"
                                                label="Bank Account Number"
                                                register={register}
                                            />
                                            <CustomInput
                                            errors={errors}
                                                type="text"
                                                name="razorpayPayload.bankAccount.ifscCode"
                                                label="IFSC Code"
                                                register={register}
                                            />
                                            <CustomInput
                                            errors={errors}
                                                type="text"
                                                name="razorpayPayload.bankAccount.beneficiaryName"
                                                label="Beneficiary Name"
                                                register={register}
                                            /> */}
                                            <FormField
                                                control={control}
                                                name="business_type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            <div className='text-gray-700 text-xl font-bold w-max mr-4 -mb-2'>Business Type</div>
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="p-2 shadow-lg outline-none rounded w-full focus:ring-4 focus:ring-blue-600/40 border-none">
                                                                    <SelectValue placeholder="Select a Business Type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {BUSINESS_TYPES.map(type => (
                                                                    <SelectItem className='cursor-pointer' value={type}>{toTitleCase(type.replace('_', ' '))}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="address.street1"
                                                label="Street Line 1"
                                                register={register}
                                                placeholder="Enter Street Line 1..."
                                            />
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="address.street2"
                                                label="Street Line 2"
                                                register={register}
                                                placeholder="Enter Street Line 2..."
                                            />
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="address.city"
                                                label="City"
                                                register={register}
                                                placeholder="Enter City..."
                                            />
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="address.state"
                                                label="State"
                                                register={register}
                                                placeholder="Enter State..."
                                            />
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="address.postal_code"
                                                label="Zip Code"
                                                register={register}
                                                placeholder="Enter Zip Code..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="razorpayPayload.kyc.pan"
                                                label="PAN"
                                                register={register}
                                                placeholder="Enter PAN..."
                                            />
                                            <CustomInput
                                                errors={errors}
                                                type="text"
                                                name="razorpayPayload.kyc.gstin"
                                                label="GSTIN (Optional)"
                                                register={register}
                                                placeholder="Enter GSTIN..."
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

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