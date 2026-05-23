import Chat from "../models/Chat.js";
import User from "../models/User.js";


//Api controller for creating a new chat


export const createChat = async (req,res) => {
    try{
        const userId = req.user._id;

        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        }
        await Chat.create(chatData);
        res.json({sucess: true , message: "Chat created"});
    }catch(err){
        res.json({sucess:false , message: err.message});
    }
}

//Api controller for getting all chats

export const getChats = async (req,res) => {
    try{
        const userId = req.user._id;
        const chats = await Chat.find({userId}).sort({updatedAt: -1});
        res.json({sucess: true , chats});

    }catch(err){
        res.json({sucess:false , message: err.message});
    }
}

//Api controller for Deleting a chats
export const deleteChats = async (req,res) => {
    try{
        const userId = req.user._id;
        const { chatId } = req.body
        await Chat.deleteOne({_id: chatId , userId});
         res.json({sucess: true , message: "Chat deleted"});

    }catch(err){
        res.json({sucess:false , message: err.message});
    }
}