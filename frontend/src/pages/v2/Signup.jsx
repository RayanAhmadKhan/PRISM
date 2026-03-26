import React from 'react'

const Signup = () => {
  return (
    <div className='flex justify-center items-center min-h-dvh w-full bg-blue-950'>
            <div className="signup-container border-2 border-gray-600 flex gap-10 m-5 p-5 flex-col rounded-md justify-center items-center bg-zinc-900 h-120 w-100">
                <div className="headings flex gap-3 justify-center items-center flex-col">
                    <h1 className='text-blue-400 font-bold text-2xl'>PRISM</h1>
                    <h1 className='text-gray-300 font-bold text-2xl'>Create Account</h1>
                </div>

                <div className="form">
                    <form action="" className='flex flex-col gap-5 justify-center items-center'>
                        <input className='w-80 h-10 bg-gray-600 rounded-sm p-2' type="text" placeholder='Email Address' />
                        <input className='w-80 h-10 bg-gray-600 rounded-sm p-2' type="text" placeholder='Create Password' />
                    </form>
                </div>

                <div className="button">
                    <button className='bg-blue-700 px-5 py-2 m-1 w-80 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>SIGNUP</button>
                </div>

                <div className="new-acc flex items-center gap-2">
                    <p className='text-gray-300'>Already have an account?</p>
                    <a href="" className='text-blue-400 underline'>Login</a>
                </div>
            </div>
        </div>
  )
}

export default Signup
