import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    userId : {
        type: String,
        ref: 'User',
        required: true
    },
    userName : {
        type: String,
        required: true
    },
    name : {
        type: String,
        required: true
    },
    messages : [
        {
            isImage: {
                type: Boolean,
                require: true,
            },
            isPublished: {
                type: Boolean,
                default: false,
            },
            role: {
                type: String,
                require: true,
            },
            content: {
                type: String,
                require: true,
            },
            timestamp: {
                type: Number,
                require: true,
            },
        }
    ]
} , {timestamps : true})

const Chat = mongoose.model('Chat' , ChatSchema);
export default Chat;