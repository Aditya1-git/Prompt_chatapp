import React, { useState } from 'react'
import useAppContext from '../context/Appcontext'
import { assets } from '../assets/assets'
import moment from 'moment';

const Sidebar = ({isMenuOpened , setIsMenuOpened}) => {
  const { chats, setSelectedChat, theme, setTheme, user , navigate, createNewChat, handleLogout } = useAppContext();
  const [search, setSearch] = useState('');
  

  return (
    <div className={`sticky top-0 flex flex-col h-screen min-w-72 p-5 dark:bg-linear-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-10 ${!isMenuOpened && 'max-md:-translate-x-full'} ` }>
      <img src={theme === 'dark' ? assets.logo_full_dark : assets.logo_full} alt="" className='w-full max-w-48' />
      <button onClick={() => { createNewChat(); setIsMenuOpened(false); }} className='flex justify-center items-center w-full py-2 mt-3
    text-white bg-linear-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md
      cursor-pointer'>
        <span className='mr-2 text-xl'>+</span> New Chat
      </button>

      <div className='flex items-center gap-2 p-3 mt-4 border border-gray-400
      dark:border-white/20 rounded-md'>
        <img src={assets.search_icon} className='w-4 shrink-0 dark:invert' alt="" />
        <input onChange={(e) => setSearch(e.target.value)} value={search} type="text" placeholder='Search conversations' className='text-xs
      placeholder:text-gray-400 outline-none'/>
      </div>

      {/* recent chats */}
      {chats.length > 0 && <p className='mt-4 text-sm'>Recent chats</p>}
      <div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3'>
        {
          chats.filter((chat) => chat.messages[0] ? chat.messages[0]?.content.
            toLowerCase().includes(search.toLowerCase()) : chat.name.toLowerCase().
              includes(search.toLowerCase())).map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat)
                      navigate('/')
                      setIsMenuOpened(false)
                    }}
                    className='p-2 px-4 dark:bg-[#57317C]/10 border
                border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer
                  flex justify-between group'
                  >
                      <div>
                          <p className='truncate w-full'>
                            {chat.messages.length > 0 ? chat.messages[0].content.slice(0,32) : chat.name}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-[#B1A6C0]'>
                            {moment(chat.updatedAt).fromNow()}
                          </p>
                      </div>
                      <img src={assets.bin_icon} className='hidden group-hover:block w-4 cursor-pointer invert' alt="" />
                  </div>
          ))
        }
      </div>

        {/* community Images */}
        <div onClick={()=> {navigate('/Community'); setIsMenuOpened(false)}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300
        dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all'>
            <img src={assets.gallery_icon} className='w-2.5 invert' alt="" />
            <div className='flex flex-col text-sm'>
                <p>Community Images</p>
            </div>
        </div>
        {/* Credit Purchase options */}
        <div onClick={()=> {navigate('/Credit'); setIsMenuOpened(false)}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300
        dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all'>
            <img src={assets.diamond_icon} className='w-2.5 ' alt="" />
            <div className='flex flex-col text-sm'>
                <p>Credits : {user?.credits}</p>
                <p>Purchase credits to Prompt more</p>
            </div>
        </div>

        {/* Dark mode toggle */}
        <div className='flex items-center gap-2 p-3 mt-4 border border-gray-300
        dark:border-white/15 rounded-md '>
            <div className='flex items-center gap-2 text-sm'>
              <img src={assets.theme_icon} className=' w-4 invert ' alt="" />
                <p>dark mode</p>
            </div>
            <label className='relative inline-flex cursor-pointer'>
                <input onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="checkbox" className='sr-only peer' checked={theme === 'dark'} />
                <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all'></div>
                <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
            </label>
        </div>

        <div className='flex items-center gap-3 p-3 mt-4 border border-gray-300
        dark:border-white/15 rounded-md cursor-pointer group text-gray-700 dark:text-white'>
            <img src={assets.user_icon} className='w-7 rounded-full' alt="" />
            <p className='flex-1 text-sm truncate'>
              {user ? user.name : 'Login your account'}
            </p>
              {user && <img onClick={() => { handleLogout(); setIsMenuOpened(false); }} src={assets.logout_icon} className='h-5 cursor-pointer block invert dark:invert-0' alt="sign out"/>}
        </div>

        <img onClick={() => setIsMenuOpened(false)} src={assets.close_icon} className='absolute top-5.5 right-4 w-5 h-5 cursor-pointer md:hidden invert' alt="" />

    </div>
  )
}

export default Sidebar