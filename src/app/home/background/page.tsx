"use client";

import BackgroundForm from "@/components/forms/backgroundForm";

export default function BackgroundPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Background Submission</h1>
      <BackgroundForm isSubmitting={false} />
    </div>
  );
}
