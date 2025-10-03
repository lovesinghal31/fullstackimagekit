import { IVideo, VIDEO_DIMENSIONS } from "@/types/Video";
import mongoose, { Schema, model, models } from "mongoose";

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    transformation: {
      height: {
        type: Number,
        default: VIDEO_DIMENSIONS.height,
      },
      width: {
        type: Number,
        default: VIDEO_DIMENSIONS.width,
      },
      quality: {
        type: Number,
        min: 1,
        max: 100,
      },
    },
  },
  { timestamps: true }
);

const VideoModel =
  (models?.Video as mongoose.Model<IVideo>) ||
  model<IVideo>("Video", videoSchema);

export default VideoModel;
