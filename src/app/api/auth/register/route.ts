import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { ApiResponse } from "@/types/ApiResponse";

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword } = await request.json();
    if (password !== confirmPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 }
      );
    }

    await dbConnect();
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 }
      );
    }

    const user = await UserModel.create({ email, password });
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Failed to create user",
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error during registration",
      },
      { status: 500 }
    );
  }
}
