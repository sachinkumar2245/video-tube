
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

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js"

export const uploadVideo = asyncHandler(async (req, res) => {
    //here i'll destruct the input data and store it in the video document in the mongooose
    const {title, description} = req.body

    //method to have the local path of the individual path files using multer
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnailFile[0]?.path;

    if (!(videoLocalPath && thumbnailLocalPath)) {
        throw new ApiError(400, "Video file and thumbnail are missing");
    }

    let video;
    try {
      
        video = await uploadOnCloudinary(videoLocalPath)

        
    } catch (error) {
        console.log(error.message);
        throw new ApiError(500, "Unable to upload video");
        
    }


    let thumbnail;
    try {
      thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    } catch (error) {
        console.log(error.message)
        throw new ApiError(500, "Unable to upload thumbnail")
    }

    try {
        const videoSavedinDoc = await Video.create({
            videoFile: video.url,
            thumbnail: thumbnail.url,
            title,
            description,
            views,
            duration: video.duration || 0,
            isPublished: true,
            owner: req.user._id 
        })

        return res.status(200).json(new ApiResponse(200, videoSavedinDoc, "Video uploaded successfully"));
    } catch (error) {
        console.log(error.message, "error uploading videos")

        if(video) {
            await deleteFromCloudinary(video.public_id)
        }

        if(thumbnail){
            await deleteFromCloudinary(thumbnail.public_id)
        }

        throw new ApiError(500, "something went wrong while uploading the video and videos were deleted")
    }

    res.status(200).json(new ApiResponse(200, video, "Video uploaded successfully"));

})