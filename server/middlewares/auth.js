import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req,res,next) => {
    let token = req.headers.authorization;
    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    if(!token){
        return res.status(401).json({message: 'not authorized, token missing'});
    }

    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET); // here we get user id
        const userId = decoded.id;
        
        const user = await User.findById(userId);

        if(!user){
            return res.json({sucess:false , message: "Not authorized , user not found"});
        }
        req.user = user;
        next()
    }catch(err){
        res.status(401).json({message:"not authorized , token failed"})
    }
}