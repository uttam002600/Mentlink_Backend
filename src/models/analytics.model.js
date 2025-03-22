import mongoose, { Schema } from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userType: {
      type: String,
      enum: ["MENTOR", "MENTEE", "ADMIN"],
      required: true,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
    cancelledSessions: {
      type: Number,
      default: 0,
    },
    averageSessionRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    responseRate: {
      type: Number, // Percentage of session requests accepted
      min: 0,
      max: 100,
      default: 0,
    },
    totalEarnings: {
      type: Number, // Only applicable for mentors
      default: 0,
    },
    totalSpent: {
      type: Number, // Only applicable for mentees
      default: 0,
    },
    engagementMetrics: {
      loginCount: { type: Number, default: 0 },
      messagesSent: { type: Number, default: 0 },
      resourcesDownloaded: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);
