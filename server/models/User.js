import mongoose from "mongoose";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const AVAILABILITY_OPTIONS = ["available", "busy", "unavailable"];
const USER_ROLES = ["user", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: BLOOD_GROUPS,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    availability: {
      type: String,
      enum: AVAILABILITY_OPTIONS,
      default: "available",
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
    },
    lastDonation: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 220,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export { AVAILABILITY_OPTIONS, BLOOD_GROUPS, USER_ROLES };

export default mongoose.model("User", userSchema);
