import mongoose, { Schema } from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["DOCUMENT", "VIDEO", "LINK", "COURSE", "OTHER"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: function () {
        return this.type === "DOCUMENT" || this.type === "VIDEO";
      },
    },
    externalLink: {
      type: String,
      required: function () {
        return this.type === "LINK" || this.type === "COURSE";
      },
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    accessLevel: {
      type: String,
      enum: ["PUBLIC", "PRIVATE", "RESTRICTED"],
      default: "PUBLIC",
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export const Resources = mongoose.model("Resources", resourceSchema);
