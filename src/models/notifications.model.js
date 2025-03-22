import mongoose, { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "SESSION_BOOKED",
        "SESSION_CANCELLED",
        "SESSION_REMINDER",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "NEW_MESSAGE",
        "MENTOR_RECOMMENDATION",
        "SYSTEM_ALERT",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: "referenceModel", // Dynamic reference
    },
    referenceModel: {
      type: String,
      enum: ["Sessions", "Payments", "Messages"], // Links to relevant models
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deliveryMethod: {
      type: String,
      enum: ["IN_APP", "EMAIL"],
      default: "IN_APP",
    },
  },
  { timestamps: true }
);

export const Notifications = mongoose.model(
  "Notifications",
  notificationSchema
);
