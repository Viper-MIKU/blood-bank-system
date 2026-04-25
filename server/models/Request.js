import mongoose from "mongoose";

const REQUEST_STATUSES = ["pending", "accepted", "rejected"];
const URGENCY_OPTIONS = ["normal", "urgent", "critical"];

const requestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "Need blood support.",
    },
    hospital: {
      type: String,
      trim: true,
      default: "",
    },
    requestLocation: {
      type: String,
      trim: true,
      default: "",
    },
    unitsNeeded: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    urgency: {
      type: String,
      enum: URGENCY_OPTIONS,
      default: "normal",
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
    },
    senderNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export { REQUEST_STATUSES, URGENCY_OPTIONS };

export default mongoose.model("Request", requestSchema);
