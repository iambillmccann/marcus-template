"use client";

import SettingsForm from "@/components/forms/settingsForm";

export default function SettingsPage() {
    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <SettingsForm />
            </div>
        </div>
    );
}