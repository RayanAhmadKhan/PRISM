import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const StProfile = () => {
  const [studentName, setStudentName] = useState("Ghulam Dastgir");
  const [rollNo, setRollNo] = useState("23L-XXXX");
  const [confidenceScore, setConfidenceScore] = useState(8.9);
  const [isFacialEnrolled, setIsFacialEnrolled] = useState(true);
  const [isFingerprintEnrolled, setIsFingerprintEnrolled] = useState(false);

  const handleFingerprintEnroll = () => {
    setIsFingerprintEnrolled(true);
  };

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Student"} user={studentName} />
      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Student Dashboard"} btn2={"Courses"} btn3={"Attendance History"} btn4={"Profile"} />
        <div className="container h-screen flex flex-col items-start bg-zinc-800 w-full overflow-y-auto">
          <div className="header w-full flex justify-between m-3 p-3">
            <h1 className='font-bold text-lg md:text-2xl'>Profile</h1>
          </div>
          <div className="st-profile-container border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-3 md:m-5 p-3 md:p-5 w-full max-w-full md:w-111 rounded-md">
            <h1 className='font-bold text-lg md:text-xl'>{studentName}</h1>
            <h1 className='text-sm md:text-base'>Roll No: {rollNo}</h1>
            <div className="confidence-score bg-zinc-800 rounded-md border-2 border-gray-600 p-3 flex justify-center items-center flex-col">
              <h1 className='font-bold text-lg md:text-xl'>Confidence Trust Score</h1>
              <h1 className='font-bold text-lg md:text-xl text-blue-400'>{confidenceScore} / 10</h1>
            </div>
          </div>
          <div className="st-startus border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-3 md:m-5 p-3 md:p-5 w-full max-w-full md:w-111 rounded-md">
            <h1 className='font-bold text-lg md:text-xl'>Biometric Enrollment Status</h1>
            <p className='text-sm md:text-base'>Manage your secure identifications methods below.</p>
            <div className="blk1 flex justify-between items-center bg-zinc-800 p-2 rounded-md border-2 border-gray-600 gap-3 flex-wrap">
              <h1 className='text-sm md:text-base'>Facial Identity (Niqab Friendly)</h1>
              <h1 className={`text-sm md:text-base font-bold ${isFacialEnrolled ? 'text-green-500' : 'text-red-500'}`}>
                {isFacialEnrolled ? 'ENROLLED' : 'NOT ENROLLED'}
              </h1>
            </div>
            <div className="blk2 flex justify-between items-center bg-zinc-800 p-2 rounded-md border-2 border-gray-600 gap-3 flex-wrap">
              <h1 className='text-sm md:text-base'>Fingerprint Data</h1>
              {isFingerprintEnrolled ? (
                <h1 className='text-green-500 font-bold uppercase text-sm md:text-base'>Enrolled</h1>
              ) : (
                <button
                  onClick={handleFingerprintEnroll}
                  className='bg-blue-700 flex justify-center w-full sm:w-25 font-bold rounded-sm cursor-pointer hover:bg-blue-900'
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StProfile