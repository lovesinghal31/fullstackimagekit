import { ApiResponse } from "@/types/ApiResponse";
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authenticationParameters = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,
    });

    console.log("Authentication Parameters:", authenticationParameters); // TODO: Remove in production after checking what does this returns and add that to in ApiResponse type
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Authentication parameters generated successfully",
        authenticationParameters,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating authentication parameters:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Failed to generate authentication parameters",
      },
      { status: 500 }
    );
  }
}
