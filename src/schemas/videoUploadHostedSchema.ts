import { z } from "zod";

export const videoUploadHostedSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be at most 120 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters"),
  videoUrl: z.string().url("Video URL is invalid"),
  thumbnailUrl: z.string().url("Thumbnail URL is invalid"),
  fileId: z.string().min(1, "File ID is required"),
  controls: z.boolean().optional(),
  transformation: z.object({
    height: z.number().min(1920, { message: "Height must be 1920" }).max(1920, { message: "Height must be 1920" }),
    width: z.number().min(1080, { message: "Width must be 1080" }).max(1080, { message: "Width must be 1080" }),
    quality: z.number().min(1).max(100)
  })
  // --- IGNORE ---
  // Optional future fields (e.g., thumbnailUrl override, quality) can be added here.
});

export type VideoUploadHostedValues = z.infer<typeof videoUploadHostedSchema>;
