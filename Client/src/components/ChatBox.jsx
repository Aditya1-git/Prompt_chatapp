import React, { useEffect, useReducer, useRef, useState } from 'react'
import useAppContext from '../context/Appcontext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets';
import Message from './Message';

const ChatBox = () => {

  const containedRef = useRef(null);
  const endRef = useRef(null);

  const { selectedChat, theme, token, setToken, setChat, setSelectedChat, user, setUser } = useAppContext();

  const [messages, setmessages] = useState([]);
  const [loading, setLoading] = useState(false);


  const [prompt , setprompt] = useState('');
  const [mode , setMod] = useState('text');
  const [isPubllished , setIsPublished] = useState(false);

    const onSubmit = async(e) => {
        e.preventDefault();
        if(!prompt || !prompt.trim()) return;
        if(!selectedChat){
          return;
        }

        try{
          setLoading(true);
          const userMsg = { role: 'user', content: prompt, timestamp: Date.now(), isImage: mode === 'image' };
          setmessages(prev => [...prev, userMsg]);

          const payload = { chatId: selectedChat._id, prompt, isPublished: isPubllished };
          const endpoint = mode === 'image' ? '/api/message/image' : '/api/message/text';
          const { data } = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });

          if(data?.reply){
            // append reply locally
            setmessages(prev => [...prev, data.reply]);

            // update global chats state so other components see messages
            setChat(prevChats => prevChats.map(c => {
              if(c._id === selectedChat._id){
                const newMessages = (c.messages || []).concat([userMsg, data.reply]);
                return { ...c, messages: newMessages, updatedAt: Date.now() };
              }
              return c;
            }));

            // update selectedChat in context
            setSelectedChat(prev => ({ ...(prev || {}), messages: (prev?.messages || []).concat([userMsg, data.reply]), updatedAt: Date.now() }));
            // decrement user credits in UI immediately
            try{
              const cost = mode === 'image' ? 2 : 1;
              setUser(prev => prev ? { ...prev, credits: (prev.credits || 0) - cost } : prev);
            }catch(e){
              // ignore
            }
          } else if(data?.sucess === false){
            toast.error(data.message || 'Failed to get reply');
          }

          setprompt('');
        }catch(err){
          if(err?.response?.status === 401){
            localStorage.removeItem('token');
            setToken(null);
            toast.error('Session expired. Please login.');
          }else{
            toast.error(err.message || 'Failed to send prompt');
          }
        }finally{
          setLoading(false);
        }
    }

  useEffect(() => {
    if (selectedChat) {
      setmessages(selectedChat.messages || []);
    }
  }, [selectedChat])

  useEffect(()=>{
    // Prefer scrolling the sentinel into view so the last message sits flush at the bottom
    if(endRef.current){
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      return;
    }
    if(containedRef.current){
      containedRef.current.scrollTo({
        top: containedRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  } , [messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 overflow-hidden md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40 h-full'>
      {/* chat messages */}
      <div ref={containedRef} className='mt-1 ml-5 flex-1 mb-5 overflow-y-auto'>
        {messages.length === 0 && (
          <div className='h-full  flex flex-col items-center justify-center gap-2
text-primary'>
            <img src={theme === 'dark' ? assets.logo_full_dark : assets.logo_full}
              alt="" className='w-full max-w-56 sm:max-w-68' />
            <p className='mt-5 text-4x1 sm: text-6xl text-center text-gray-400
dark:text-white'>Ask me anything.</p>
          </div>
        )}

        {messages.map((message , index)=> <Message key={index} message={message} />)}
        <div ref={endRef} />

        {/* Three Dots Loading */}
        {
          loading && <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        }
      </div>

        {mode === 'image' && (
          <label className='flex w-full items-center justify-center gap-2 mb-3 text-sm'>
            <p className='text-xs'>Publish generated Image to Community</p>
            <input
              type="checkbox"
              className='h-4 w-4 shrink-0 cursor-pointer accent-purple-600'
              checked={isPubllished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          </label>
        )}

      {/* Prompt input box */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e) =>  setMod(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Img</option>
        </select>
        <input onChange={(e) => setprompt(e.target.value)} value={prompt} type="text" placeholder='Type your prompt here...' className='flex-1 w-full text-sm outline-none' required />
        <button type="submit" disabled={loading}>  
        <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="" />
        </button>
      </form>
    </div>
  )
}

export default ChatBox