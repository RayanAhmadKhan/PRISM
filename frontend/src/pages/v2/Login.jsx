import React, { useState } from 'react' // 1. Import useState
import { Link } from 'react-router-dom';

const Login = () => {
    // 2. Define states for inputs and UI feedback
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");

    // 3. Handle the login click
    const handleLogin = (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Please fill in all fields.");
            return;
        }
        setError(""); // Clear error if fields are full
        console.log("Logging in with:", { username, password, rememberMe });
    };

    return (
        <div className='flex justify-center items-center min-h-dvh w-full bg-blue-950'>
            <div className="login-container border-2 border-gray-600 flex gap-10 m-5 p-5 flex-col rounded-md justify-center items-center bg-zinc-900 h-130 w-100">
                <div className="headings flex gap-3 justify-center items-center flex-col">
                    <h1 className='text-blue-400 font-bold text-2xl'>PRISM</h1>
                    <h1 className='text-gray-300 font-bold text-2xl'>Login</h1>
                </div>

                <div className="form">
                    <form className='flex flex-col gap-5 justify-center items-center'>
                        {/* 4. Connect Username input */}
                        <input 
                            className='w-80 h-10 bg-gray-600 rounded-sm p-2 text-white' 
                            type="text" 
                            placeholder='Username / Email' 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {/* 5. Connect Password input (changed type to password for security) */}
                        <input 
                            className='w-80 h-10 bg-gray-600 rounded-sm p-2 text-white' 
                            type="password" 
                            placeholder='Password' 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </form>
                </div>

                {/* Display error message if it exists */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="after-form flex justify-between gap-20 items-center w-80">
                    <div className="checkbox flex justify-between items-center gap-2">
                        <input 
                            type="checkbox" 
                            className='w-3 h-3' 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <p className='text-gray-300 text-sm'>Remember me</p>
                    </div>

                    <div className="forgot">
                        <a className='text-blue-400 text-sm' href="#forgot">Forgot?</a>
                    </div>
                </div>

                <div className="button">
                    <button 
                        onClick={handleLogin}
                        className='bg-blue-700 px-5 py-2 m-1 w-80 font-bold rounded-sm cursor-pointer hover:bg-blue-900'
                    >
                        LOGIN
                    </button>
                </div>

                <div className="new-acc flex items-center gap-2">
                    <p className='text-gray-300'>New here?</p>
                    <Link to="/pages/v2/Signup" className='text-blue-400 underline'>Create Account</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
