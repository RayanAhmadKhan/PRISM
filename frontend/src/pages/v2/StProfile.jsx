import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const StProfile = () => {
  return (
    <div className='min-h-dvh w-full'>
            <Navbar title={"Student"} user={"Ghulam Dastgir"} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Dashboard"} btn2={"Courses"} btn3={"Attendance Record"} btn4={"Profile"} />

                <div className="container h-screen flex flex-col items-start bg-zinc-800">
                    <div className="header w-7xl flex justify-between m-3 p-3">
                        <h1 className='font-bold text-2xl'>Profile</h1>
                    </div>

                    <div className="st-profile-container border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-5 p-5 w-111 rounded-md">
                        <h1 className='font-bold text-xl'>Ghulam Dastgir</h1>

                        <h1>Roll No: 23L-XXXX</h1>

                        <div className="confidence-score bg-zinc-800 rounded-md border-2 border-gray-600 p-3 flex justify-center items-center flex-col">
                            <h1 className='font-bold text-xl'>Confidence Trust Score</h1>

                            <h1 className='font-bold text-xl text-blue-400'>8.9 / 10</h1>
                        </div>
                    </div>

                    <div className="st-startus border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-5 p-5 w-111 rounded-md">
                        <h1 className='font-bold text-xl'>Biometric Enrollment Status</h1>

                        <p>Manage your secure identifications methods below.</p>

                        <div className="blk1 flex justify-between bg-zinc-800 p-2 rounded-md border-2 border-gray-600">
                            <h1>Facial Identity (Niqab Friendly)</h1>

                            <h1 className='text-green-500 font-bold'>ENROLLED</h1>
                        </div>

                        <div className="blk2 flex justify-between bg-zinc-800 p-2 rounded-md border-2 border-gray-600">
                            <h1>Fingerprint Data</h1>

                            <button className='bg-blue-700 flex justify-center w-25 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Enroll Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default StProfile
