"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "./FileUpload";
import {
  videoUploadHostedSchema,
  VideoUploadHostedValues,
} from "@/schemas/videoUploadHostedSchema";
import { apiClient } from "@/lib/api-client";
import { ImageKitUploadResponse } from "./FileUpload";
import { useRouter } from "next/navigation";

const VideoUploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadData, setUploadData] = useState<ImageKitUploadResponse | null>(
    null
  );

  const router = useRouter()

  const form = useForm<VideoUploadHostedValues>({
    resolver: zodResolver(videoUploadHostedSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      fileId: "",
      thumbnailUrl: "",
      controls: true,
      transformation: { height: 1920, width: 1080, quality: 100 },
    },
  });

  const hasUploaded = !!uploadData;

  const onSubmit = async (values: VideoUploadHostedValues) => {
    if (!uploadData) {
      toast.error("Please upload a video first");
      return;
    }
    setIsSubmitting(true);
    try {
      const thumbnailUrl =`${uploadData.url}/ik-thumbnail.jpg`; // could generate separate thumbnail via ImageKit transformations
      await apiClient.createVideo({
        title: values.title,
        description: values.description,
        videoUrl: uploadData.url,
        fileId: uploadData.fileId,
        thumbnailUrl,
        controls: values.controls,
        transformation: { height: 1920, width: 1080, quality: 100 },
      });
      const toastId = toast.success("Video uploaded successfully", {
        style: { height: "50px" },
        action: {
          label: <Trash2 className="w`-4 h-4" />,
          onClick: () => toast.dismiss(toastId),
        },
      });
      form.reset();
      setUploadData(null);
      setUploadProgress(null);
      router.replace('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      console.log(error);
      const toastId = toast.error(errorMessage, {
        style: { height: "50px" },
        action: {
          label: <Trash2 className="w-4 h-4" />,
          onClick: () => toast.dismiss(toastId),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md border-2">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-4xl mb-6">
            Upload Your Video
          </h1>
          <p className="mb-4">Upload your video file to ImageKit</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            autoComplete="off"
          >
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="videoUrl"
              control={form.control}
              render={() => (
                <FormItem className="cursor-pointer">
                  <FormLabel>Upload Video</FormLabel>
                  <FormControl>
                    <FileUpload
                      fileType="video"
                      onProgress={(p) => setUploadProgress(p)}
                      onSuccess={(res: ImageKitUploadResponse) => {
                        console.log("Upload success:", res);
                        const mapped: ImageKitUploadResponse = {
                          fileId: res.fileId,
                          url: res.url,
                          name: res.name,
                          size: res.size,
                          fileType: res.fileType,
                          height: res.height,
                          width: res.width,
                          thumbnailUrl: res.thumbnailUrl || res.url,
                        };
                        setUploadData(mapped);
                        form.setValue("videoUrl", mapped.url, {
                          shouldValidate: true,
                        });
                        form.setValue("fileId", mapped.fileId, {
                          shouldValidate: true,
                        });
                        form.setValue("thumbnailUrl", mapped.thumbnailUrl, {
                          shouldValidate: true,
                        });
                        form.setValue(
                          "transformation",
                          {
                            height: mapped.height,
                            width: mapped.width,
                            quality: 100,
                          },
                          { shouldValidate: true }
                        );
                        form.setValue("controls", true, {
                          shouldValidate: true,
                        });
                        setUploadProgress(100);
                        toast.success("Upload complete");
                      }}
                    />
                  </FormControl>
                  {uploadProgress !== null && uploadProgress < 100 && (
                    <p className="text-xs mt-1">Uploading: {uploadProgress}%</p>
                  )}
                  {hasUploaded && (
                    <p className="text-xs mt-1 text-green-500">
                      Uploaded: {uploadData?.name} (
                      {Math.round((uploadData?.size || 0) / 1024)} KB)
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting || !hasUploaded}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Video"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VideoUploadForm;
