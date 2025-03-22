import mongoose, { Schema } from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: ["USER", "SESSION", "RESOURCE", "OTHER"],
      required: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.reportType === "USER";
      },
    },
    reportedSession: {
      type: Schema.Types.ObjectId,
      ref: "Sessions",
      required: function () {
        return this.reportType === "SESSION";
      },
    },
    reportedResource: {
      type: Schema.Types.ObjectId,
      ref: "Resources",
      required: function () {
        return this.reportType === "RESOURCE";
      },
    },
    description: {
      type: String,
      required: true,
    },
    evidence: [
      {
        fileUrl: String,
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "RESOLVED", "ESCALATED"],
      default: "PENDING",
    },
    assignedAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Reports = mongoose.model("Reports", reportSchema);
