import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


//here we generate acess and refresh roken

const generateAcessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId) //database connection
        if (!user) {
            throw new ApiError(401, "User not found")
        }

        const acessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();

        //
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { acessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating acess and refresh token!");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body

    //validation like zod

    //    if(fullName ?.trim() === ""){ this code is useable but more standard and efficient code is here
    //     throw new ApiError(400, "All fields are required");
    //    }

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    };

    //business logic

    // this code we wrote in the first iteration now we'll refactor the code in a better version of it

    // const avatar = await uploadOnCloudinary(avatarLocalPath);

    // let coverImage = "";
    // if(coverLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverLocalPath);
    // }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Uploaded avatar", avatar);

    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new ApiError(500, "Failed to upload avatar");


    }


    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath);
        console.log("Uploaded cover Image", coverImage);

    } catch (error) {
        console.log("Error uploading cover image", error);
        throw new ApiError(500, "Failed to upload cover Image");
    }


    try {

        const user = await User.create({ // its coming from the database
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong whle registering the user");

        }

        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User registered successfully"))
    } catch (error) {
        console.log("Error uploading avatar", error);

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }

        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new ApiError(500, "Something went wrong while registering a users and images were delted")

    }

});

//its not a helper method its a route

const loginUser = asyncHandler(async (req, res) => {

    //get data from body
    const { email, username, password } = req.body;

    //validation

    if (!email) {
        throw new ApiError(400, "Email is required!");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //validate password

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { acessToken, refreshToken } = await generateAcessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!loggedInUser) {
        throw new ApiError(401, "User not logged In")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV = "production",
    }


    return res
        .status(200)
        .cookie("acessToken", acessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            { user: loggedInUser, acessToken, refreshToken },
            "User logged in successfully"
        ))
})

//logout route
const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },

        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("acessToken", options)
        .clearCookie("refrshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

//refresh access token method

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,

        )

        const user = User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")

        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const { acessToken, refreshToken: newRefreshToken } = await generateAcessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("acessToken", acessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        acessToken,
                        refreshToken: newRefreshToken
                    },
                    "Acess token refreshed successfully"
                )
            )

    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing the access token");
    }
})

//changing current password route

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    //validating the old password

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        throw new ApiError(401, "Old password is incrorrect");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
});

// get current user

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user details"));
});

//update user avatar

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Files are required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(500, "Something went wrong while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                avatar: avatar.url
            }
        },

        { new: true },


    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

//update user cover image

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Files are required")
    }

    const cImage = await uploadOnCloudinary(imageLocalPath)

    if (!cImage.url) {
        throw new ApiError(500, "Something went wrong while uploading image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                coverImage: cImage.url
            }
        },

        { new: true },


    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Image updated successfully"));

});

//updating account details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "Fullname and email are required")
    }



    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true } //return the updated data
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
});

//fetching user channel 
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username, } = req.params //req.params is something that gets you anything from the url when user is visting
    if (!username.trim()) {
        throw new ApiError(400, "Username is required")
    };

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },

            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },

            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },

            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    chanelsSubscribedToCount : {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },

            {
                //project only the necessary data
                $project: {
                    fullName: 1,
                    username,
                    email: 1,
                    avatar: 1,
                    subscribersCount: 1,
                    chanelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    coverImage: 1
                }
            }
        ]
    )

    if(!channel?.length){
        throw new ApiError(404, "Channel not found")
    }

    return res.status(200).json( new ApiResponse(200, channel[0], "Channel Profile fetched successfully"))
})

// fetching user watch history
const getUserWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },

            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as:"owner",
                                pipeline:[
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    },

                                    {
                                        $addFields: {
                                            owner: {
                                                $first: "$owner"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    );

    return res.status(200).json(new ApiResponse(200, user[0], "watch history fetched successfully"))
 })

//exporting the files
export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateAccountDetails,
    getUserChannelProfile,
    getUserWatchHistory
}