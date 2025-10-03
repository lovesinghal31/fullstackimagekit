import { dbConnect } from "@/lib/dbConnect";
import VideoModel from "@/models/Video";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IVideo, VIDEO_DIMENSIONS } from "@/types/Video";

export async function GET() {
  try {
    await dbConnect();

    const videos = await VideoModel.find({}).sort({ createdAt: -1 }).lean();
    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Videos fetched successfully",
        videos,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: (error as Error).message || "Failed to fetch videos",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await dbConnect();

    const body: IVideo = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.videoUrl ||
      !body.thumbnailUrl
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const videoData = {
      ...body,
      controls: body?.controls ?? true,
      transformation: {
        height: VIDEO_DIMENSIONS.height,
        width: VIDEO_DIMENSIONS.width,
        quality: body.transformation?.quality ?? 100,
      },
    };

    const newVideo = await VideoModel.create(videoData);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Video uploaded successfully",
        uploadedVideo: newVideo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in POST /api/video:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: (error as Error).message || "Failed to upload video",
      },
      { status: 500 }
    );
  }
}
