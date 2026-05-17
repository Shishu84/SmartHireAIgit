import User from "../models/user.model.js"


export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message:"user does not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`failed to get currentUser ${error}`})
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { profilePhoto, skills, experience, socials, activeResumeUrl } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
        if (skills !== undefined) user.skills = skills;
        if (experience !== undefined) user.experience = experience;
        if (socials !== undefined) user.socials = socials;
        if (activeResumeUrl !== undefined) user.activeResumeUrl = activeResumeUrl;

        await user.save();
        return res.status(200).json(user);
    } catch (error) {
         return res.status(500).json({ message: `failed to update profile ${error}` });
    }
}