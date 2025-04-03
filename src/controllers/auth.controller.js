import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // console.log("User for token generation:", user);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log("Generated Access Token:", accessToken);
    // console.log("Generated Refresh Token:", refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, error.message || "Error generating tokens");
  }
};

const checkUsername = asyncHandler(async (req, res) => {
  try {
    const { username } = req.query; // Use query parameters as per frontend

    // 🔹 Validate if username is provided
    // if (!username?.trim()) {
    //   throw new ApiError(400, "Username is required");
    // }

    // 🔹 Check if the username exists in the database
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });

    return res.status(200).json({
      success: true,
      available: !existingUser, // `true` if username is available, `false` if taken
      message: existingUser
        ? "Username already taken"
        : "Username is available",
    });
  } catch (error) {
    throw new ApiError(500, "Error checking username availability");
  }
});

const generateOtp = asyncHandler(async (req, res) => {
  try {
    //* Fetch the email from req.body
    const email = req.body.email;

    if (!email) {
      return res.status(400).send("Enter the email");
    }

    //* Check if the user already exists
    const exisitingUser = await User.findOne({ email });
    //* If yes, then return
    if (exisitingUser) {
      throw new ApiError(408, "User already Exists");
    }

    //* Generate the otp with the help of the otp Generator in helper function
    function generateOTP() {
      return otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
    }

    var newOTP = generateOTP();
    //* Check if the OTP is unique or not
    var exisitingOTP = await OTP.findOne({ otp: newOTP });

    while (exisitingOTP) {
      newOTP = generateOTP();
      exisitingOTP = await OTP.findOne({ otp: newOTP });
    }

    //* Store the OTP in the DB
    const storingOTP = await OTP.create({ email, otp: newOTP });

    console.log("OTP Stored successfully! ", storingOTP);

    res.status(201).json({
      status: "success",
      message: "OTP sent successfully!",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      data: "Failed to create a new OTP",
      message: err.message,
    });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, role, college, otp } = req.body;

  // 🔹 Validate required fields
  if (
    [fullName, username, email, password, role, college, otp].some(
      (field) => !field?.trim()
    )
  ) {
    throw new ApiError(400, "All fields are required, including OTP");
  }

  // 🔹 Verify OTP
  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // 🔹 Delete OTP after successful verification
  await OTP.deleteOne({ email });

  // 🔹 Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // 🔹 Create user object
  const newUser = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    role, // "MENTOR" or "MENTEE"
    college,
    mentorDetails: role === "MENTOR" ? { mentorType: null } : undefined,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "Registration done successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // 🔹 Validate if username or email is provided
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // 🔹 Find the user by username OR email
  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // 🔹 Check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  // 🔹 Generate Access & Refresh Tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // 🔹 Fetch user details without password & refresh token
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 🔹 Set secure cookie options
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  // 🔹 Send response with cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  // removing the accessToken from schema when logedOut
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or invalid");
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentpassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  //we using middleware of auth to get req.user to get the info about the logged in user which we will be injecting in route

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Password entered is incorrect (Old one)");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading an avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar successfully updated"));
});

export {
  generateOtp,
  registerUser,
  checkUsername,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentpassword,
  updateUserAvatar,
};
