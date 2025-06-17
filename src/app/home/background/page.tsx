"use client";

import { useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

import { useAuth } from "@/context/authContext";
import BackgroundForm from "@/components/forms/backgroundForm";

const MAX_FILE_SIZE_MB = 5; // Set a file size limit of 5 MB

interface BackgroundFormValues {
  file: File | null;
  biography: string;
}

export default function BackgroundPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error("You must be logged in to upload files.");
      return;
    }

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"].includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF, DOCX, TXT, or MD file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`);
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { files: { [file.name]: fileURL } },
        { merge: true }
      );

      toast.success("File uploaded successfully.");
    } catch (error) {
      console.error("Error uploading file:", error);
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "storage/retry-limit-exceeded") {
        toast.error("Upload failed due to retry limit. Please try again later.");
      } else {
        toast.error("Failed to upload file.");
      }
    }
  };

  const handleBiographySubmit = async (biography: string) => {
    if (!user) {
      toast.error("You must be logged in to submit a biography.");
      return;
    }

    try {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { biography },
        { merge: true }
      );
      toast.success("Biography submitted successfully.");
    } catch (error) {
      console.error("Error submitting biography:", error);
      toast.error("Failed to submit biography.");
    }
  };

  const onSubmit = async (values: BackgroundFormValues) => {
    setIsSubmitting(true);
    try {
      if (values.file) {
        await handleFileUpload(values.file);
      }
      if (values.biography) {
        await handleBiographySubmit(values.biography);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Background Submission</h1>
      <BackgroundForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
