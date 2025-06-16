"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/authContext";

interface BackgroundFormValues {
  file: File | null;
  biography: string;
}

const MAX_FILE_SIZE_MB = 5; // Set a file size limit of 5 MB

export default function BackgroundPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<BackgroundFormValues>({
    defaultValues: {
      file: null,
      biography: "",
    },
  });

  const handleFileUpload = async (file: File) => {
    console.log("Starting file upload...");
    if (!user) {
      toast.error("You must be logged in to upload files.");
      console.log("User not logged in.");
      return;
    }

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"].includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF, DOCX, TXT, or MD file.");
      console.log("Invalid file type:", file.type);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`);
      console.log("File size exceeds limit:", file.size);
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      console.log("Uploading file to storage...");
      await uploadBytes(storageRef, file);
      console.log("File uploaded to storage.");

      const fileURL = await getDownloadURL(storageRef);
      console.log("File URL retrieved:", fileURL);

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      console.log("Saving file URL to Firestore...");
      await setDoc(
        userRef,
        { files: { [file.name]: fileURL } },
        { merge: true }
      );
      console.log("File URL saved to Firestore.");

      toast.success("File uploaded successfully.");
    } catch (error) {
      console.error("Error uploading file:", error);
      const firebaseError = error as { code?: string; message?: string };
      console.error("Firebase Error Code:", firebaseError.code);
      console.error("Firebase Error Message:", firebaseError.message);
      if (firebaseError.code === "storage/retry-limit-exceeded") {
        toast.error("Upload failed due to retry limit. Please try again later.");
      } else {
        toast.error("Failed to upload file.");
      }
    } finally {
      console.log("File upload process completed.");
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
    console.log("Form submission started.");
    try {
      if (values.file) {
        await handleFileUpload(values.file);
      }
      if (values.biography) {
        await handleBiographySubmit(values.biography);
      }
    } finally {
      setIsSubmitting(false);
      console.log("Form submission completed.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Background Submission</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="file"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="biography"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biography</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={5}
                    placeholder="Write your biography here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
