import mongoose, { Schema } from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    availableDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    timeSlots: [
      {
        startTime: {
          type: String, // Format: "HH:MM"
          required: true,
        },
        endTime: {
          type: String, // Format: "HH:MM"
          required: true,
        },
        isBooked: {
          type: Boolean,
          default: false,
        },
        bookedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    slotDuration: {
      type: Number, // In minutes (e.g., 30, 45, 60)
      required: true,
      default: 30,
    },
    recurrence: {
      type: String,
      enum: ["ONE_TIME", "WEEKLY", "MONTHLY"],
      default: "WEEKLY",
    },
  },
  { timestamps: true }
);

export const Availability = mongoose.model("Availability", availabilitySchema);
