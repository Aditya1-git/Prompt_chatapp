

import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";
import openai from "../configs/openai.js";

// Text-based Ai chat Message controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.credits < 1) {
            return res.json({ sucess: false, message: "you don't have enough credits to use this feature" });
        }
        const { chatId, prompt } = req.body;
        const chat = await Chat.findOne({ userId, _id: chatId });
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

        const { choices } = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };
        res.json({ sucess: true, reply });

        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    } catch (err) {
        res.json({ sucess: false, message: err.message })
    }
}

//image generation message controller

export const imageMessageController = async (req, res) => {

    try {
        const userId = req.user._id;
        //check credits
        if (req.user.credits < 2) {
            return res.json({ sucess: false, message: "you don't have enough credits to use this feature" });
        }
        const { prompt, chatId, isPublished } = req.body;
        //find chat
        const chat = await Chat.findOne({ userId, _id: chatId });
        //push User message
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false })

        //Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt);

        //construct imageKit ai generation url
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/Prompt/${Date.now()}.png?tr=w-800,h-800`;

        //Trigger generation by fetching from Imagekit
        const aiImageResponse = await axios.get(generatedImageUrl , {responseType: "arraybuffer"}); // this will call the fetch on the this -> generatedImageUrl

        //convert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`;
        //upload to ImageKit Media Library
        const uploadresponse = await imagekit.upload({
            file:base64Image,
            fileName: `${Date.now()}.png`,
            folder: "Prompt"
        })

        const reply = { role: 'assistant', content: uploadresponse.url, timestamp: Date.now(), isImage: true, isPublished: Boolean(isPublished) };

        // ensure chat exists
        if (!chat) {
            return res.json({ sucess: false, message: "Chat not found" });
        }

        // push reply and persist before sending response
        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

        return res.json({ sucess: true, reply });
    }
    catch (err) {
        res.json({ sucess: false, message: err.message })
    }
}