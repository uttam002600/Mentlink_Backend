import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, index: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    avatar: { type: String, required: false }, // Cloudinary URL
    role: { type: String, enum: ["MENTOR", "MENTEE", "ADMIN"], required: true },
    college: { type: String, required: false },

    // 🔹 Common Field: Domain of Interest (for Mentees)
    domainOfInterest: [{ type: String }], // Mentees specify their interest areas

    // 🔹 Common Field: Mentor Expertise
    expertiseDomains: [{ type: String }], // Mentors list their expert domains

    // 🔹 Mentor Categories (Specialization Areas)
    mentorshipCategories: {
      type: [String],
      enum: [
        "Web Development",
        "Data Science",
        "Cloud Computing",
        "Business",
        "CAT Guidance",
        "AI/ML",
        "Cybersecurity",
        "Blockchain",
        "Product Management",
        "Entrepreneurship",
      ],
    },

    mentorDetails: {
      mentorType: { type: String, enum: ["PROFESSOR", "ALUMNI", "PEER_GROUP"] },
      ratings: [
        {
          menteeId: { type: Schema.Types.ObjectId, ref: "User" },
          rating: Number,
          review: String,
        },
      ],
      professorDetails: {
        yearsOfExperience: Number,
        domainExpertise: [String],
        researchPublications: [String],
        designation: String,
      },
      alumniDetails: {
        batchPassout: Number,
        domainExpertise: [String],
        companiesWorkedAt: [
          { companyName: String, position: String, duration: String },
        ],
        currentCompany: String,
        currentPosition: String,
      },
      peerGroupDetails: {
        currentYear: Number,
        projects: [String],
        achievements: [String],
      },
    },

    menteeDetails: {
      bookedSessions: [{ type: Schema.Types.ObjectId, ref: "Sessions" }],
      learningGoals: [String],
      notes: [
        {
          sessionId: { type: Schema.Types.ObjectId, ref: "Sessions" },
          content: String,
        },
      ],
      feedbackGiven: [
        {
          mentorId: { type: Schema.Types.ObjectId, ref: "User" },
          rating: Number,
          comments: String,
        },
      ],
    },

    adminDetails: { permissions: [String] },

    refreshToken: { type: String },
  },
  { timestamps: true }
);

// **🔹 Middleware for Password Hashing**
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// **🔹 Method to Check Password**
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// **🔹 Generate JWT Access Token**
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// **🔹 Generate JWT Refresh Token**
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model("User", userSchema);
