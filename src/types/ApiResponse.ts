import { IVideo } from "./Video";

export interface ApiResponse {
    success: boolean;
    message: string;
    videos?: IVideo[];
    uploadedVideo?: IVideo;
    publicKey?: string;
    authenticationParameters?: {
        token?: string;
        expire?: number;
        signature?: string;
    };
}