"use client";

import BackgroundForm from "@/components/forms/backgroundForm";

export default function BackgroundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Background Submission</h1>
        <BackgroundForm isSubmitting={false} />
      </div>
    </div>
  );
}
