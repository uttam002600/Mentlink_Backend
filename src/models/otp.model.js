import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";
import emailTemp from "../mail/templates/emailVerificationTemplate.js";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60, // OTP expires in 5 minutes
  },
});

// Middleware to send OTP email before saving
otpSchema.pre("save", async function (next) {
  console.log(this.email);
  await mailSender(this.email, "Verification Email", emailTemp(this.otp));
  console.log("Hello from middleware otp");
  next();
});

export const OTP = mongoose.model("OTP", otpSchema);
