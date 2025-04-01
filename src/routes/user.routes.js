import { Router } from "express";

import {
  getUserProfile,
  updateAccountdetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { verify } from "jsonwebtoken";

const router = Router();

// USER
router.route("/update-account-details").patch(verifyJWT, updateAccountdetails);
router.route("/getUser").get(verifyJWT, getUserProfile);

export default router;
