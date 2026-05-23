import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext()

export const AppContextprovider = ({ children }) =>{

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chats, setChat] = useState([]);
    const [selectedChat, setSelectedChat ] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [token, setToken] = useState(localStorage.getItem('token') || null );
    const [loadingUser , setLoadinguser] = useState(true);

    const fetchUser = async() => {
        try{
            const {data} = await axios.get('/api/user/data' , {headers: {Authorization: `Bearer ${token}`}})
            if(data.success || data.sucess){
                setUser(data.user);
            }else{
                toast.error(data.message || data.msg || 'Failed to fetch user');
            }
        }catch(err){
            if(err?.response?.status === 401){
                localStorage.removeItem('token');
                setToken(null);
                toast.error('Session expired. Please login.');
            }else{
                toast.error(err.message || 'Failed to fetch user');
            }
        }
        finally{
            setLoadinguser(false);
        }
    }

    const createNewChat = async () => {
            try{
                if(!user) return toast('Login to create a new chat');
                navigate('/');
                await axios.get('/api/chat/create' , {headers: {Authorization: `Bearer ${token}`}});
                await fetchUserChats();
            }catch(err){
                if(err?.response?.status === 401){
                    localStorage.removeItem('token');
                    setToken(null);
                    toast.error('Session expired. Please login.');
                }else{
                    toast.error(err.message || 'Failed to create chat');
                }
            }
    }
 
    const fetchUserChats = async () => {
        try{
            const { data } = await axios.get('/api/chat/get' , {headers: {Authorization: `Bearer ${token}`}});
            if(data.success || data.sucess){
                setChat(data.chats);
                //If the user has no chats
                if(data.chats.length === 0){
                    await createNewChat();
                    return fetchUserChats();
                }else{
                    setSelectedChat(data.chats[0]);
                }
            }else{
                toast.error(data.message || 'Failed to fetch chats');
            }
        }catch(err){
            if(err?.response?.status === 401){
                localStorage.removeItem('token');
                setToken(null);
                toast.error('Session expired. Please login.');
            }else{
                toast.error(err.message || 'Failed to fetch chats');
            }
        }       
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setChat([]);
        setSelectedChat(null);
        navigate('/login');
    }

    useEffect(()=> {
        if(theme === 'dark'){
            document.documentElement.classList.add('dark');
        }else{
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme' , theme);
    }, [theme])

    useEffect(() => {
        if(token){
            fetchUser();
        }
        else{
            setUser(null);
            setLoadinguser(false);
        }
    } ,[token])

    useEffect(() => {
        if(user){
            fetchUserChats();
        }
        else{
            setChat([]);
            setSelectedChat(null);
        }
    } ,[user])

    const value = {  navigate , user , setUser , chats , setChat , selectedChat , setSelectedChat , theme , setTheme ,createNewChat , loadingUser , fetchUser , fetchUserChats , handleLogout , token , setToken , axios}
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

const useAppContext = () => useContext(AppContext);

export { useAppContext };
export default useAppContext;