import mongoose , {Schema} from "mongoose";

const likeSchema  = new Schema({
    //either of video, comment, or tweet will be assigned here

    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },

    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },

    community: {
        type: Schema.Types.ObjectId,
        ref: "Commuinity"
    },
    
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

export const Like = mongoose.model("Like", likeSchema);