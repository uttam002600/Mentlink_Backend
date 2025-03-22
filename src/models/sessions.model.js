import mongoose, { Schema } from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    menteeId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    meetingLink: {
      type: String,
      default: "",
    },
    sessionType: {
      type: String,
      enum: ["ONE_ON_ONE", "GROUP"],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "CANCELLED", "COMPLETED", "RESCHEDULED"],
    },
    notes: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    rating: {
      menteeRating: { type: Number, min: 1, max: 5 },
      menteeFeedback: { type: String },
    },
    rescheduleDetails: {
      previousDate: { type: Date },
      previousTime: { type: String },
      rescheduledBy: { type: Schema.Types.ObjectId, ref: "user" },
    },
  },
  {
    timestamps: true,
  }
);

export const Sessions = mongoose.model("Sessions", sessionSchema);
