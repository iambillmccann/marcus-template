import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface BackgroundFormProps {
    onSubmit: (values: BackgroundFormValues) => Promise<void>;
    isSubmitting: boolean;
}

interface BackgroundFormValues {
    file: File | null;
    biography: string;
}

const BackgroundForm: React.FC<BackgroundFormProps> = ({ onSubmit, isSubmitting }) => {
    const form = useForm<BackgroundFormValues>({
        defaultValues: {
            file: null,
            biography: "",
        },
    });

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
