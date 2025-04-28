"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ForgotPasswordForm } from "@/components/forms/sendPasswordResetEmail";

interface LoginFormValues {
    email: string;
    password: string;
}

export function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const form = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    if (showForgotPassword) {
        return (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((values) => {
                    console.log("Logging in with:", values);
                    onLogin();
                })}
                className="space-y-4 w-full"
            >
                <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    id="email"
                                    placeholder="Enter your email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="mt-2 text-left">
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>

                <Button type="submit" className="w-full">
                    Log In
                </Button>
            </form>
        </Form>
    );
}