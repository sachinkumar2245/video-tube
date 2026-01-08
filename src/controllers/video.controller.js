
//TODO: Implement video controller functions
// 1. uploadVideo on cloudinary
// 2. deleteVideo from cloudinary
// 3. getVideoDetails
// 4. user watch history update
// 5. getWatchHistory
// 6. clearWatchHistory
// 7. likeVideo
// 8. dislikeVideo
// 9. addToPlaylist
// 10. removeFromPlaylist
// 11. getPlaylist
// 12. incrementVideoViews
// 13. searchVideos
// 14. commentOnVideo
// 15. getVideoComments
// 16. deleteComment
// 17. updateComment
// 18. replyToComment
// 19. getCommentReplies
// 20. deleteReply

import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const uploadVideo = asyncHandler( async (req, res) => {
    const videoLocalPath = req.files?.videoFile[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is missing");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    if (!video) {
        throw new ApiError(500, "Failed to upload video");
    }

    res.status(200).json(new ApiResponse(200, video, "Video uploaded successfully"));
})