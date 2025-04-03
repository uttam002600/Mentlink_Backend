import { Router } from "express";
import {
  loginUser,
  logOutUser,
  registerUser,
  checkUsername,
  refreshAccessToken,
  changeCurrentpassword,
  updateUserAvatar,
  generateOtp,
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { verify } from "jsonwebtoken";

const router = Router();

//AUTHENTICATION
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/send-otp").post(generateOtp);
router.route("/check-username").get(checkUsername);
//secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentpassword);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
