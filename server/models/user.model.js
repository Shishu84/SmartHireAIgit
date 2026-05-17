import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    credits: {
        type: Number,
        default: 500000
    },
    profilePhoto: { 
        type: String, 
        default: "" 
    },
    skills: { 
        type: [String], 
        default: [] 
    },
    experience: { 
        type: String, 
        default: "" 
    },
    socials: {
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        portfolio: { type: String, default: "" }
    },
    activeResumeUrl: { 
        type: String, 
        default: "" 
    }

}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User