import react, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/Appcontext'
import { useNavigate } from 'react-router-dom'

const Login = () => {

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

        const { setToken } = useAppContext();
        const navigate = useNavigate();

        const handleSubmit = async (e) => {
            e.preventDefault();
            try{
                const payload = state === 'register' ? { name, email, password } : { email, password };
                const url = state === 'register' ? '/api/user/register' : '/api/user/login';
                const { data } = await axios.post(url, payload);
                const token = data?.token;
                if(token){
                    localStorage.setItem('token', token);
                    setToken(token);
                    toast.success(state === 'register' ? 'Account created' : 'Logged in');
                    navigate('/');
                }else{
                    const msg = data?.message || data?.error || 'Authentication failed';
                    toast.error(msg);
                }
            }catch(err){
                toast.error(err.message || 'Request failed');
            }

        }

  return(
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-purple-700">User</span> {state === "login" ? "Login" : "Sign Up"}
            </p>
            {state === "register" && (
                <div className="w-full">
                    <p>Name</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700" type="text" required />
                </div>
            )}
            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700" type="password" required />
            </div>
            {state === "register" ? (
                <p>
                    Already have account? <span onClick={() => setState("login")} className="text-purple-700 cursor-pointer">click here</span>
                </p>
            ) : (
                <p>
                    Create an account? <span onClick={() => setState("register")} className="text-purple-700 cursor-pointer">click here</span>
                </p>
            )}
            <button type='submit' className="bg-purple-700 hover:bg-purple-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                {state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
  )
}

export default Login