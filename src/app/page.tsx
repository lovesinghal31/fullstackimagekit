"use client";
import VideoFeed from "@/components/VideoFeed";
import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/types/Video";
import { useEffect, useState } from "react";

export default function Home() {
  const [videoFeed, setVideoFeed] = useState<IVideo[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiClient.getVideos();
        setVideoFeed(response.videos);
      } catch (error) {
        console.log(error);
      }
    };  
    fetchVideos();
  }, []);

  return (
    <>
      <VideoFeed videos={videoFeed} />
    </>
  );
}
