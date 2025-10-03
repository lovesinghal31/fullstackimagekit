import { ApiResponse } from "@/types/ApiResponse";
import { IVideo } from "@/types/Video";
import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";

export type VideoFormData = Omit<IVideo, "_id">;

// Narrowed custom request options while still compatible with Axios config
export interface RequestOptions<TData> {
  method?: Method; // e.g. 'GET' | 'POST' | ...
  data?: TData; // request body
  headers?: AxiosRequestConfig["headers"];
  params?: AxiosRequestConfig["params"]; // query params
}

export interface VideoFeed {
  success: boolean;
  message: string;
  videos: IVideo[];
}

class ApiClient {
  private client = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
  });

  private async request<TResponse, TData>(
    endpoint: string,
    { method = "GET", data, headers, params }: RequestOptions<TData> = {}
  ): Promise<TResponse> {
    try {
      const res = await this.client.request<TResponse>({
        url: endpoint,
        method,
        data,
        headers,
        params,
      });
      return res.data;
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      // Extract a meaningful message
      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" && error.response.data) ||
        error.message ||
        "Request failed";
      throw new Error(message);
    }
  }

  // Videos
  async getVideos(): Promise<VideoFeed> {
    return this.request<VideoFeed, undefined>("/videos");
  }

  async createVideo(videoData: VideoFormData): Promise<IVideo> {
    return this.request<IVideo, VideoFormData>("/videos", {
      method: "POST",
      data: videoData,
    });
  }
}

export const apiClient = new ApiClient();
