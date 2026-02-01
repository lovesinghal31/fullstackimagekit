"use client";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { useState } from "react";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";



export interface ImageKitUploadResponse {
  fileId: string;
  url: string;
  name: string;
  size: number;
  fileType: string;
  height: number;
  width: number;
  thumbnailUrl: string;
}

interface FileUploadProps {
  onSuccess: (response: ImageKitUploadResponse) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file.");
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds the 100MB limit.");
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    setUploading(true);
    setError(null);
    try {
      const response = await axios.get("/api/imagekit-auth");
      console.log("response",response)
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,
        signature: response.data.authenticationParameters.signature,
        expire: response.data.authenticationParameters.expire,
        token: response.data.authenticationParameters.token,
        onProgress: (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = (event.loaded / event.total) * 100;
                onProgress(Math.round(percent))
            }
        },
      });
      // console.log("Upload Response: ",uploadResponse)
      onSuccess({
        fileId: uploadResponse.fileId,
        url: uploadResponse.url,
        name: uploadResponse.name,
        size: uploadResponse.size,
        fileType: uploadResponse.fileType,
        height: uploadResponse.height,
        width: uploadResponse.width,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
      } as ImageKitUploadResponse);
    } catch (err) {
      if (err instanceof ImageKitAbortError) {
        console.log("Upload aborted:", err.reason);
        setError(`Upload aborted: ${err.reason}`);
      } else if (err instanceof ImageKitInvalidRequestError) {
        console.log("Invalid request:", err.message);
        setError(`Invalid request: ${err.message}`);
      } else if (err instanceof ImageKitServerError) {
        console.log("Server error:", err.message);
        setError(`Server error: ${err.message}`);
      } else if (err instanceof ImageKitUploadNetworkError) {
        console.log("Network error:", err.message);
        setError(`Network error: ${err.message}`);
      } else {
        console.log("Upload error:", err);
        setError(`Upload error: ${err}`);
      }
      const toastId = toast.error(error, {
        style: {
          height: "50px",
        },
        action: {
          label: <Trash2 className="w-4 h-4" />,
          onClick: () => toast.dismiss(toastId),
        },
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Input
        type="file"
        accept={fileType === "video" ? "video/*" : "image/*"}
        className="cursor-pointer"
        onChange={handleFileChange}
      />
      {uploading && <span>Uploading...</span>}
    </>
  );
};

export default FileUpload;
