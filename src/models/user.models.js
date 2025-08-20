import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String, //cloudinary URL
            required: true
        },

        coverImage: {
            type: String, //cloudinary URL

        },

        watchHistroy: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password: {
            type: String,
            required: [true, "password is required"]
        },

        refreshToken: {
            type: String
        },

    },
    {
        timestamps: true
    }
);

//here we trigger an event which basically means before saving the event and this hook is also kind of middleware

userSchema.pre("save", async function (next) { //all these middlewares need a parameter next because of req, res, and next. Next is the way to pass on the request from one middleware to other middleware or finally to the point it wants to go.

    if (!this.isModified("password")) return next(); //classic function has the acess of this except arrow function

    this.password = await bcrypt.hash(this.password, 10); //here we are encrypting the password using bcrypt js

    next();
});

//password verification

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // it compares the cliet given password and saved password in the database
}


//jwt token

userSchema.methods.generateAcessToken = function () {
    //short lived access token - it means the expiry time totally depends on me

    return jwt.sign(
        { //payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,

        },
        
        process.env.ACESS_TOKEN_SECRET, //secret key

        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY //expiry duration
        }
    )
}


//generate refresh token

userSchema.methods.generateRefreshToken = function () {
    //short lived access token - it means the expiry time totally depends on me

    return jwt.sign(
        {
            _id: this._id,
            
        },
        
        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}





export const User = mongoose.model("User", userSchema);