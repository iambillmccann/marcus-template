"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

interface LoginFormValues {
    email: string;
    password: string;
}

export function LoginForm({
    onLogin,
    onForgotPassword,
    onBackToLogin,
}: {
    onLogin: () => void;
    onForgotPassword: () => void;
    onBackToLogin: () => void;
}) {
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handlePasswordReset = async (email: string) => {
        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent. Please check your inbox.");
            setShowForgotPassword(false);
            onBackToLogin(); // Notify parent to show the header again
        } catch (error: unknown) {
            toast.error("Failed to send password reset email. Please try again.");
            console.error("Password reset error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPasswordClick = () => {
        setShowForgotPassword(true);
        onForgotPassword(); // Notify parent to hide the header
    };

    const handleBackToLoginClick = () => {
        setShowForgotPassword(false);
        onBackToLogin(); // Notify parent to show the header again
    };

    if (showForgotPassword) {
        return (
            <form
                onSubmit={form.handleSubmit((values) => handlePasswordReset(values.email))}
                className="space-y-4 w-full"
            >
                <h1 className="text-2xl font-semibold text-left">Reset your password</h1>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...form.register("email", { required: "Email is required" })}
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Reset password"}
                </Button>
                <div className="mt-2 text-left">
                    <button
                        type="button"
                        onClick={handleBackToLoginClick}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Back to sign in
                    </button>
                </div>
            </form>
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
                        onClick={handleForgotPasswordClick}
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