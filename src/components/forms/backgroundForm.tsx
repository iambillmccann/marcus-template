import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";

interface BackgroundFormProps {
    isSubmitting: boolean;
}

interface BackgroundFormValues {
    file: File | null;
    biography: string;
}

const MAX_FILE_SIZE_MB = 5; // Set a file size limit of 5 MB

const BackgroundForm: React.FC<BackgroundFormProps> = ({ isSubmitting }) => {
    const { user } = useAuth();

    const form = useForm<BackgroundFormValues>({
        defaultValues: {
            file: null,
            biography: "",
        },
    });

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
        if (values.file) {
            await handleFileUpload(values.file);
        }
        if (values.biography) {
            await handleBiographySubmit(values.biography);
        }
    };

    return (
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
    );
};

export default BackgroundForm;
