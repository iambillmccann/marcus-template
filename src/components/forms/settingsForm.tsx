import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { getAuth, updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";
import { useTheme } from "@/context/themeContext";

type ThemeType = "light" | "dark" | "system";

const SettingsForm: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isOAuthUser, setIsOAuthUser] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [idToken, setIdToken] = useState<string>("");

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            theme: theme,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                form.reset({
                    name: user.displayName || "",
                    email: user.email || "",
                    theme,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                const isOAuth = user.providerData.some(
                    (provider) => provider.providerId !== "password"
                );
                setIsOAuthUser(isOAuth);

                // Fetch and set ID token
                const token = await user.getIdToken();
                setIdToken(token);
            } else {
                setIdToken("");
            }
        });

        return () => unsubscribe();
    }, [theme, form]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const values = form.getValues();

            if (!user) {
                throw new Error("No user is currently signed in.");
            }

            if (values.name !== user.displayName) {
                await updateProfile(user, { displayName: values.name });
            }

            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);
            await setDoc(
                userRef,
                { theme: values.theme },
                { merge: true }
            );

            if (
                !isOAuthUser &&
                values.currentPassword &&
                values.newPassword &&
                values.confirmPassword
            ) {
                if (values.newPassword !== values.confirmPassword) {
                    throw new Error("New password and confirmation do not match.");
                }

                const credential = EmailAuthProvider.credential(
                    user.email!,
                    values.currentPassword
                );
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, values.newPassword);
                toast.success("Password changed successfully.");
            }

            toast.success("Profile settings saved.");

            form.reset({
                name: values.name,
                email: values.email,
                theme: values.theme,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err: unknown) {
            console.error("Error saving changes:", err);
            setError(getFriendlyFirebaseErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push("/home");
    };

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSave)}>
                {/* Name Field */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Enter your name"
                                    disabled={isSaving}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email Field */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Enter your email"
                                    disabled
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ID Token Field */}
                <FormItem>
                    <FormLabel>ID Token</FormLabel>
                    <FormControl>
                        <textarea
                            value={idToken}
                            readOnly
                            disabled
                            rows={4}
                            className="font-mono text-xs w-full resize-y bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 p-2"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {/* Theme Field */}
                <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setTheme(value as ThemeType);
                                    }}
                                    value={field.value}
                                    disabled={isSaving}
                                >
                                    <SelectTrigger id="theme">
                                        <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Password Fields */}
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Enter your current password"
                                        disabled={isOAuthUser}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                        tabIndex={-1}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        disabled={isOAuthUser}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        disabled={isOAuthUser}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-32 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCancel}
                        className="w-32 bg-gray-500 hover:bg-gray-600 text-white"
                    >
                        Cancel
                    </Button>
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </Form>
    );
};

export default SettingsForm;
