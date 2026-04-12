import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    if (email && password) {
      console.log("Account Created:", { email, password });
      setIsSignedUp(true);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-dvh w-full bg-blue-950 px-4'>
      <div className="signup-container border-2 border-gray-600 flex gap-8 md:gap-10 m-5 p-5 flex-col rounded-md justify-center items-center bg-zinc-900 h-auto md:h-130 w-full max-w-sm md:w-100">
        <div className="headings flex gap-3 justify-center items-center flex-col">
          <h1 className='text-blue-400 font-bold text-2xl'>PRISM</h1>
          <h1 className='text-gray-300 font-bold text-xl md:text-2xl'>Create Account</h1>
        </div>
        {isSignedUp ? (
          <div className="text-center px-2">
            <p className='text-green-400 font-bold'>Account created successfully!</p>
            <p className='text-gray-300 text-sm md:text-base'>Check your email to verify.</p>
          </div>
        ) : (
          <>
            <div className="form w-full flex justify-center">
              <form className='flex flex-col gap-5 justify-center items-center w-full'>
                <input
                  className='w-full max-w-xs md:w-80 h-10 bg-gray-600 rounded-sm p-2 text-white'
                  type="text"
                  placeholder='Email Address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className='w-full max-w-xs md:w-80 h-10 bg-gray-600 rounded-sm p-2 text-white'
                  type="password"
                  placeholder='Create Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </form>
            </div>
            <div className="button w-full max-w-xs md:w-80">
              <button
                onClick={handleSignup}
                className='bg-blue-700 px-5 py-2 m-1 w-full font-bold rounded-sm cursor-pointer hover:bg-blue-900'
              >
                SIGNUP
              </button>
            </div>
          </>
        )}
        <div className="new-acc flex items-center gap-2 flex-wrap justify-center">
          <p className='text-gray-300 text-sm md:text-base'>Already have an account?</p>
          <Link to="/pages/v2/Login" className='text-blue-400 underline text-sm md:text-base'>Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup