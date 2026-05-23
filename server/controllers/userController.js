import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";


//Generate jwt
const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET , {
        expiresIn: '30d'
    })
}


// API to register user
export const registerUser = async (req , res) => {
    const { name , email , password } = req.body;

    try{
        const userExists = await User.findOne({email});
        if(userExists) {
            return res.json({sucess: false , message : "User already exists"});
        }
        const user = await User.create({name,email,password});
        const token = generateToken(user._id);
        res.json({sucess:true , token});
    }catch(err){
        return res.json({sucess:false , message : err.message});
    }
}

//Api to login user

export const loginUser = async (req, res) => {
    const { email , password } = req.body;
    try{

        const userExists = await User.findOne({email});
        if(userExists){
            const isMatched = await bcrypt.compare(password,userExists.password)

            if(isMatched){
                const token = generateToken(userExists._id);
                return res.json({sucess:true ,token});
            }
            return res.json({sucess:false , message: "Invalid email or Password"});
        }else{
            return res.json({sucess:false , message: "Invalid email or Password"});
        }

    }catch(err){
        return res.json({sucess:false , message : err.message});
    }
}

//Api to get user data
export const getUser = async (req, res) => {
    try{
        const user = req.user;
        return res.json({sucess:true , user});
    }catch(err){
        return res.json({sucess:false , message : err.message});
    }
}

//Pi to ger Published images
export const getPublishedImages =  async (req,res) => {
    try {
        const publishedImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match : {
                    "messages.isImage" : true,
                    "messages.isPublished" : true
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }

        ])

        res.json({sucess:true , images : publishedImageMessages.reverse()});
    } catch (err) {
        res.json({sucess:false , message:err.message});
    }
}