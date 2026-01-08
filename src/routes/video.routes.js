import { upload } from "../middlewares/multers.middlewares.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { uploadVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/upload").post(
    verifyJWT,
    upload.single([
        {
            name: "videoFile",
            maxCount: 1
        }
    ]),
    uploadVideo
)

export default router;