import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multers.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js"

//getting router module from express
const router = Router();

router.route("/register").post( //unsecured routes as they can be accessed by anyone
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },

        {
            name: "coverImage",
            maxCount: 1
        }
    ]),

    registerUser
);

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)


// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile); // to get the current user info
router.route("/update-account").put(verifyJWT, updateAccountDetails); // to update the current user account
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar); // to update the current user avatar
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage); // to update the current user cover image
router.route("/watch-history").get(verifyJWT, getUserWatchHistory); // to get the current user watch history


export default router;