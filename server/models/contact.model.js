import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Technical Support", "Billing Support", "Enterprise Inquiry", "Partnership", "General Inquiry"]
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "resolved"]
    }
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);
