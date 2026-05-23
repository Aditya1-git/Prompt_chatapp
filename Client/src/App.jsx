import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Credit from './Pages/Credit'
import Community from './Pages/Community'
import ChatBox from './components/ChatBox'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './Pages/Loading'
import useAppContext from './context/Appcontext'
import Login from './Pages/login'
import {Toaster} from 'react-hot-toast';
const App = () => {

  const {user , loadingUser} = useAppContext();


const [isMenuOpened , setIsMenuOpened] = useState(false);
const {pathname} = useLocation();
if(pathname === '/Loading' || loadingUser) return <Loading/>

  return (
    <>
    <Toaster/>
      {!isMenuOpened && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden invert' onClick={() => setIsMenuOpened(true)}/>}
      
      {user ? (
        <div className='bg-white dark:bg-linear-to-b dark:from-[#242124] dark:to-[#000000] dark:text-white text-black min-h-screen'>
        <div className='flex h-screen w-screen'>
          <Sidebar isMenuOpened={isMenuOpened} setIsMenuOpened={setIsMenuOpened}/>
          <div className='flex-1 flex flex-col h-screen bg-white dark:bg-linear-to-b dark:from-[#242124] dark:to-[#000000]'>
            <Routes>
              <Route path='/' element={<ChatBox />} />
              <Route path='/Credit' element={<Credit />} />
              <Route path='/Community' element={<Community />} />
            </Routes>
          </div>
        </div>
      </div>
      ) : (
        <div className='bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen'>
          <Login/>
        </div>
      )}
      
    </>
  )
}

export default App