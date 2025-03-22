import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId)
    .select("-password -refreshToken") // Exclude sensitive fields
    .populate("mentorDetails") // Fetch full mentor details
    .populate("menteeDetails"); // Fetch full mentee details

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateAccountdetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updateData = req.body;

  // 🔹 Prevent unauthorized field modifications
  const restrictedFields = ["role", "email", "password", "_id", "refreshToken"];
  restrictedFields.forEach((field) => delete updateData[field]);

  try {
    let user = await User.findById(userId)
      .populate("mentorDetails")
      .populate("menteeDetails")
      .populate("adminDetails");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 🔹 Generic Profile Updates
    ["fullName", "username", "college"].forEach((field) => {
      if (updateData[field]) user.set(field, updateData[field]);
    });

    // 🔹 Mentee-Specific Updates
    if (user.role === "MENTEE" && user.menteeDetails) {
      ["domainOfInterest", "menteeDetails.learningGoals"].forEach((field) => {
        if (updateData[field]) user.set(field, updateData[field]);
      });
    }

    // 🔹 Mentor-Specific Updates
    if (user.role === "MENTOR") {
      user.mentorDetails = user.mentorDetails || {}; // Ensure it's not null

      ["expertiseDomains", "mentorshipCategories", "mentorType"].forEach(
        (field) => {
          if (updateData[field])
            user.set(`mentorDetails.${field}`, updateData[field]);
        }
      );

      // Mentor Type-Specific Updates
      if (user.mentorDetails.mentorType === "PROFESSOR") {
        [
          "yearsOfExperience",
          "domainExpertise",
          "researchPublications",
          "designation",
        ].forEach((field) => {
          if (updateData[field])
            user.set(
              `mentorDetails.professorDetails.${field}`,
              updateData[field]
            );
        });
      }

      if (user.mentorDetails.mentorType === "ALUMNI") {
        [
          "batchPassout",
          "domainExpertise",
          "companiesWorkedAt",
          "currentCompany",
          "currentPosition",
        ].forEach((field) => {
          if (updateData[field])
            user.set(`mentorDetails.alumniDetails.${field}`, updateData[field]);
        });
      }

      if (user.mentorDetails.mentorType === "PEER_GROUP") {
        ["currentYear", "projects", "achievements"].forEach((field) => {
          if (updateData[field])
            user.set(
              `mentorDetails.peerGroupDetails.${field}`,
              updateData[field]
            );
        });
      }
    }

    // 🔹 Admin-Specific Updates
    if (user.role === "ADMIN") {
      if (updateData.adminDetails?.permissions) {
        user.set(
          "adminDetails.permissions",
          updateData.adminDetails.permissions
        );
      }
    }

    // 🔹 Save Updated User Profile
    await user.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error updating profile");
  }
});

export { getUserProfile, updateAccountdetails };
