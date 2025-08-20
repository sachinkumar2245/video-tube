import mongoose , {Schema} from "mongoose";

const subsctiptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //one who's subscribing
        ref: "User"
    },

    channel: {
        type: Schema.Types.ObjectId, // one to whom subscriber is SUBSCRIBING,
        ref: "User"
    },
}, {timestamps: true});

export const Subscription = mongoose.model("Subscription", subsctiptionSchema);