import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Request from "./models/Request.js";
import User, { AVAILABILITY_OPTIONS, BLOOD_GROUPS } from "./models/User.js";

dotenv.config();

const app = express();

const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("DB ERROR:", error));

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const adminOnly = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("role");

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.currentUser = user;
  return next();
};

const toSafeUser = (user, options = {}) => {
  const {
    includeEmail = false,
    includeRole = false,
  } = options;

  const resolvedAvailability = user.availability || "available";
  const resolvedRole =
    user.role || (ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? "admin" : "user");

  return {
    _id: user._id,
    name: user.name,
    bloodGroup: user.bloodGroup,
    location: user.location,
    availability: resolvedAvailability,
    lastDonation: user.lastDonation || "",
    bio: user.bio || "",
    ...(includeEmail ? { email: user.email } : {}),
    ...(includeRole ? { role: resolvedRole } : {}),
  };
};

const withRequestContactRules = (request, viewer) => {
  const isAccepted = request.status === "accepted";
  const isSender = String(request.sender?._id || request.sender) === String(viewer);
  const isReceiver = String(request.receiver?._id || request.receiver) === String(viewer);

  const sender = request.sender?._id
    ? toSafeUser(request.sender, {
        includeEmail: isAccepted && (isSender || isReceiver),
        includeRole: false,
      })
    : request.sender;

  const receiver = request.receiver?._id
    ? toSafeUser(request.receiver, {
        includeEmail: isAccepted && (isSender || isReceiver),
        includeRole: false,
      })
    : request.receiver;

  return {
    _id: request._id,
    sender,
    receiver,
    message: request.message,
    hospital: request.hospital,
    requestLocation: request.requestLocation,
    unitsNeeded: request.unitsNeeded,
    urgency: request.urgency,
    status: request.status,
    senderNotified: request.senderNotified,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
};

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, bloodGroup, location } = req.body;

    if (!name || !email || !password || !bloodGroup || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: "Invalid blood group" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "user";

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      bloodGroup,
      location,
      role,
    });

    await newUser.save();

    return res.json({ message: "Registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.trim().toLowerCase() }).select("+password role");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const resolvedRole =
      user.role || (ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? "admin" : "user");

    const token = jwt.sign(
      { id: user._id, role: resolvedRole },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/api/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(toSafeUser(user, { includeEmail: true, includeRole: true }));
  } catch {
    return res.status(500).json({ message: "Error fetching profile" });
  }
});

app.put("/api/me", auth, async (req, res) => {
  try {
    const { name, location, bloodGroup, availability, lastDonation, bio } = req.body;

    if (!name || !location || !bloodGroup) {
      return res.status(400).json({ message: "Name, blood group, and city are required" });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: "Invalid blood group" });
    }

    if (!AVAILABILITY_OPTIONS.includes(availability)) {
      return res.status(400).json({ message: "Invalid availability option" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        location,
        bloodGroup,
        availability,
        lastDonation: lastDonation || "",
        bio: bio || "",
      },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({
      message: "Profile updated",
      user: toSafeUser(user, { includeEmail: true, includeRole: true }),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/api/users", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    return res.json(users.map((user) => toSafeUser(user)));
  } catch {
    return res.status(500).json({ message: "Error fetching users" });
  }
});

app.post("/api/request", auth, async (req, res) => {
  try {
    const {
      receiverId,
      message,
      hospital = "",
      requestLocation = "",
      unitsNeeded = 1,
      urgency = "normal",
    } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Choose a donor first" });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ message: "Cannot request yourself" });
    }

    const receiver = await User.findById(receiverId).select("availability");

    if (!receiver) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const existing = await Request.findOne({
      sender: req.user.id,
      receiver: receiverId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const newRequest = new Request({
      sender: req.user.id,
      receiver: receiverId,
      message: message?.trim() || "Need blood support.",
      hospital: hospital?.trim() || "",
      requestLocation: requestLocation?.trim() || "",
      unitsNeeded: Number(unitsNeeded) || 1,
      urgency,
    });

    await newRequest.save();

    return res.json({ message: "Request sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/api/my-requests", auth, async (req, res) => {
  try {
    const requests = await Request.find({ receiver: req.user.id })
      .populate("sender", "name email bloodGroup location availability lastDonation bio")
      .sort({ createdAt: -1 });

    return res.json(requests.map((request) => withRequestContactRules(request, req.user.id)));
  } catch {
    return res.status(500).json({ message: "Error fetching requests" });
  }
});

app.get("/api/my-sent-requests", auth, async (req, res) => {
  try {
    const requests = await Request.find({ sender: req.user.id })
      .populate("receiver", "name email bloodGroup location availability lastDonation bio")
      .sort({ createdAt: -1 });

    return res.json(requests.map((request) => withRequestContactRules(request, req.user.id)));
  } catch {
    return res.status(500).json({ message: "Error fetching sent requests" });
  }
});

app.get("/api/notifications", auth, async (req, res) => {
  try {
    const notifications = await Request.find({
      sender: req.user.id,
      status: { $in: ["accepted", "rejected"] },
      senderNotified: false,
    })
      .populate("receiver", "name email bloodGroup location availability")
      .sort({ updatedAt: -1 });

    return res.json(
      notifications.map((request) => ({
        _id: request._id,
        status: request.status,
        updatedAt: request.updatedAt,
        receiver: toSafeUser(request.receiver, {
          includeEmail: request.status === "accepted",
        }),
      }))
    );
  } catch {
    return res.status(500).json({ message: "Error fetching notifications" });
  }
});

app.put("/api/notifications/read", auth, async (req, res) => {
  try {
    await Request.updateMany(
      {
        sender: req.user.id,
        status: { $in: ["accepted", "rejected"] },
        senderNotified: false,
      },
      { senderNotified: true }
    );

    return res.json({ message: "Notifications marked as read" });
  } catch {
    return res.status(500).json({ message: "Error updating notifications" });
  }
});

app.put("/api/request/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = status;
    request.senderNotified = false;
    await request.save();

    return res.json({ message: "Request updated" });
  } catch {
    return res.status(500).json({ message: "Error updating request" });
  }
});

app.get("/api/admin/overview", auth, adminOnly, async (req, res) => {
  try {
    const [users, requests] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }),
      Request.find()
        .populate("sender", "name bloodGroup location")
        .populate("receiver", "name bloodGroup location")
        .sort({ createdAt: -1 })
        .limit(12),
    ]);

    const summary = {
      totalUsers: users.length,
      availableDonors: users.filter((user) => user.availability === "available").length,
      pendingRequests: await Request.countDocuments({ status: "pending" }),
      acceptedRequests: await Request.countDocuments({ status: "accepted" }),
    };

    return res.json({
      summary,
      users: users.map((user) => toSafeUser(user, { includeEmail: true, includeRole: true })),
      requests: requests.map((request) => ({
        _id: request._id,
        status: request.status,
        urgency: request.urgency,
        unitsNeeded: request.unitsNeeded,
        requestLocation: request.requestLocation,
        createdAt: request.createdAt,
        sender: request.sender,
        receiver: request.receiver,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
