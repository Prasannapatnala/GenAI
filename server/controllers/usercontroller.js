
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const {sendverificationEmail,sendEmail} = require('../services/sendermail');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role,phone_number } = req.body;
        const db = getDB();
        const normalizedEmail = email.toLowerCase();

        const existingUser = await db.collection('users').findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "user already exist"
            });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const result = await db.collection('users').insertOne({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    phone_number: phone_number || "",
    role: role || 'user',
    isVerified: false,
    createdAt: new Date()
});
        const token = jwt.sign({ userId: result.insertedId, email: normalizedEmail },
            process.env.JWT_SECRET,{expiresIn:"1d"});
      /*  await sendverificationEmail(normalizedEmail,name,token);
        */
            try {
                await sendverificationEmail(normalizedEmail, name, token);
                console.log("Email sent successfully");
            } catch (mailError) {
                console.error("EMAIL ERROR:", mailError);
            }
        res.status(201).json({message: 'User registered successfully',
            userId: result.insertedId
        });
    }

    catch(error){
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
        message:'server error',
        error: error.message
    });
}
}

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, "access_secret_key", { expiresIn: '15d' });
}
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, "refresh_secret_key", { expiresIn: '7d' });
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDB();
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if(!user.isVerified){
            return res.status(403).json({ message: "Please verify your email before logging in" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await db.collection('users').updateOne({ _id: user._id }, { $set: { refreshToken } });
        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }   
}
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, "refresh_secret_key");
        } catch (error) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const db = getDB();
        const user = await db.collection('users').findOne({
    email: decoded.email,
    refreshToken: refreshToken
});
        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        await db.collection('users').updateOne({ _id: user._id }, { $set: { refreshToken: newRefreshToken } });

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const sendPasswordResetOTP = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email){
            return res.status(400).json({ message: "Email is required" });
        }
        const db = getDB();
        const userCollection = db.collection('users');
        const normalizedEmail = email.toLowerCase();
        const user = await userCollection.findOne({ email: normalizedEmail });

        if (!user){
            return res.status(404).json({ message: "No account found for this email" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        console.log(`Forgot password requested for ${normalizedEmail}. Generated OTP: ${otp}`);
        await userCollection.updateOne(
            { _id: user._id },
            { $set: {
                reset_password_otp_hash: otpHash,
                reset_password_otp_expires_at: expiresAt,
                updatedAt: new Date(),
                },
            }
        );
        const emailResult = await sendEmail({
            to : normalizedEmail,
            subject:'shopMATE Password Reset OTP',
            text:`Your Password reset OTP is : ${otp}. It will expires in 15 mins.`,
            html:`<p> Your password reset OTP is :<p><h2> ${otp} </h2><p> This code expires in 15 mins.</p>`,
        });
        console.log('Forget password email sent:',emailResult&&emailResult.response);
        return res.status(200).json({message:'OTP sent to your email address'});
    }
    catch(error){
        console.error('Forgot password error',error);
        return res.status(500).json({message:'Couldnot sent otp.',error:error.message});
    }
};    
 
const resetPassword = async(req,res)=>{
    try{
        const{email,otp,newPassword,confirmPassword}=req.body;
        if(!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({message:"All fields are required "});
        }
        if(newPassword !== confirmPassword){
            return res.status(400).json({message:"Passwords do not match"});
        }
        const db = getDB();
        const userCollection = db.collection('users');
        const normalizedEmail = email.toLowerCase();
        const user = await userCollection.findOne({ email: normalizedEmail });
        if (!user){
            return res.status(400).json({message:"user not found"});
        }
        if(!user.reset_password_otp_hash || !user.reset_password_otp_expires_at){
            return res.status(400).json({message : "No otp request found. Please request a new otp."});
        }
        const otpExpired = new Date() > new Date(user.reset_password_otp_expires_at);
        if(otpExpired){
            return res.status(400).json({message : "OTP has expired. Please request a new OTP."});
        }
        const validOtp = await bcrypt.compare(otp,user.reset_password_otp_hash);
        if(!validOtp){
            return res.status(400).json({message:"Invalid OTP"});
        }
        const hashesPassword = await bcrypt.hash(newPassword,10);
        await userCollection.updateOne(
            {_id: user._id},
            {
                $set:{
                    password:hashesPassword,
                    refreshToken: null,
                    reset_password_otp_hash:null,
                    reset_password_otp_expires_at:null,
                    updatedAt:new Date(),
                },
            }
        );
        return res.status(200).json({message:'password updated successfully. Please login with your new Password'});
    }
    catch(error){
        console.error('Reset Password error:',error);
        return res.status(500).json({message:'could not reset Password.',error:error.message});
    }
};

module.exports= {registerUser, loginUser, generateAccessToken, generateRefreshToken, refreshToken, resetPassword,sendPasswordResetOTP};