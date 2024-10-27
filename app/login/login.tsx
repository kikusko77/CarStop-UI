'use client'
import React, {useState} from 'react';
import {signIn} from 'next-auth/react';
import {Button} from "primereact/button";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AuthenticationData, AuthenticationSchema} from "@/app/eloryks/schema/authenticationSchema";
import get from "lodash/get";
import {InputText} from "primereact/inputtext";
import {Card} from 'primereact/card';
import Image from 'next/image';
import VutLogo from "@/public/vut.svg"
import CvutLogo from "@/public/cvut.svg"
import MvcrLogo from "@/public/mvcr.svg"
import {Password} from "primereact/password";

const LoginPageForm: React.FC = () => {
    const [signInError, setSignInError] = useState<string | null>(null);
    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<AuthenticationData>({
        resolver: zodResolver(AuthenticationSchema),
        defaultValues: {
            email: undefined,
            pwd: undefined,
        },
    });
    const [loading, setLoading] = useState<boolean>(false);
    let state = {intl: { locale: 'cs' }}
    const onSubmit = async ({email, pwd}: AuthenticationData) => {
        setLoading(true)
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                pwd,
                callbackUrl: process.env.NEXT_PUBLIC_APP_BASE_PATH
            });

            if (result?.error) {
                setSignInError("Email and password combination doesn't exist");
            } else {
                localStorage.setItem('state', JSON.stringify(state))
                // @ts-ignore
                window.location.href = result.url;
                setSignInError(null);
            }
        } catch (error) {
            console.error("Sign-in error:", error);
            setSignInError("An unexpected error occurred.");
        } finally {
            setLoading(false)
        }
    };

    const getFormErrorMessage = (name: keyof AuthenticationData | string) => {
        const error = errors[name as keyof AuthenticationData] || get(errors, name);
        return error && <small className="p-error">{error.message}</small>;
    };

    return (
        <div className="flex align-items-center justify-content-center" style={{ height: '100vh', width: '100vw' }}>
            <Card title={<h1 className="card-title">Eloryks</h1>} className='card-background text-center p-fluid mt-8 sm:w-9 md:w-7 lg:w-6 xl:w-5'>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column align-items-center">
                    {/* Email Field */}
                    <div className='field sm:w-9 md:w-9 lg:w-9 xl:w-9'>
                        <Controller
                            name="email"
                            control={control}
                            render={({field, fieldState}) => (
                                <span className="p-input-icon-right">
                                  <i>@</i>
                           <InputText
                               id={field.name}
                               value={field.value ?? ''}
                               onChange={(e) => field.onChange(e.target.value)}
                               className={`${fieldState.invalid ? "p-invalid" : ""}`}
                               placeholder="Email"
                               size={40}
                           />
                                </span>
                            )}/>
                        {getFormErrorMessage("email")}
                    </div>

                    <div className='field sm:w-9 md:w-9 lg:w-9 xl:w-9'>
                        {/* Password Field */}
                        <Controller
                            name="pwd"
                            control={control}
                            render={({field, fieldState}) => (
                                <Password
                                    id={field.name}
                                    value={field.value ?? ''}
                                    placeholder="Password"
                                    className={`${fieldState.invalid ? "p-invalid" : ""}`}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    toggleMask
                                    feedback={false}
                                    size={40}
                                />
                            )}
                        />
                        {getFormErrorMessage("pwd")}
                    </div>
                        {signInError &&
                            <div style={{color: 'red', textAlign: 'center', marginTop: '1rem'}}>{signInError}</div>}

                        {/* Login Button */}
                        <div className='field sm:w-9 md:w-9 lg:w-9 xl:w-9'>
                            <Button label="Login" icon="pi pi-user" loading={loading}
                                    onClick={handleSubmit(onSubmit)}/>
                        </div>
                </form>
                {/* Logo Section */}
                <div className='flex flex-row justify-content-center align-items-center mt-4 gap-1'>
                        <Image src={VutLogo} alt={'vut'} className='uniform-image'/>
                        <Image src={CvutLogo} alt={'cvut'} className='uniform-image mr-3'/>
                        <Image src={MvcrLogo} alt={'mvcr'} className='uniform-image'/>
                </div>
            </Card>
        </div>
    )
}
export default LoginPageForm
