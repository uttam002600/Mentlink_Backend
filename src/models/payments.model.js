import mongoose, { Schema } from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    payer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.paymentType === "SESSION_BOOKING";
      },
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Sessions",
      required: function () {
        return this.paymentType === "SESSION_BOOKING";
      },
    },
    paymentType: {
      type: String,
      enum: ["SESSION_BOOKING", "SUBSCRIPTION", "DONATION", "OTHER"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "UPI", "BANK_TRANSFER"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    transactionId: {
      type: String,
      unique: true,
    },
    paymentGateway: {
      type: String,
      required: true,
    },
    refundStatus: {
      type: String,
      enum: ["NOT_REQUESTED", "REQUESTED", "PROCESSING", "COMPLETED", "DENIED"],
      default: "NOT_REQUESTED",
    },
  },
  { timestamps: true }
);

export const Payments = mongoose.model("Payments", paymentSchema);
