import React, { useState } from 'react' // 1. Import useState
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const StProfile = () => {
  // 2. Define states for student data and enrollment statuses
  const [studentName, setStudentName] = useState("Ghulam Dastgir");
  const [rollNo, setRollNo] = useState("23L-XXXX");
  const [confidenceScore, setConfidenceScore] = useState(8.9);
  
  // Boolean states to track if biometric data is enrolled
  const [isFacialEnrolled, setIsFacialEnrolled] = useState(true);
  const [isFingerprintEnrolled, setIsFingerprintEnrolled] = useState(false);

  // 3. Logic to handle enrollment click
  const handleFingerprintEnroll = () => {
    // Simulate an enrollment process
    setIsFingerprintEnrolled(true);
  };

  return (
    <div className='min-h-dvh w-full'>
            <Navbar title={"Student"} user={studentName} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Student Dashboard"} btn2={"Courses"} btn3={"Attendance History"} btn4={"Profile"} />

                <div className="container h-screen flex flex-col items-start bg-zinc-800">
                    <div className="header w-7xl flex justify-between m-3 p-3">
                        <h1 className='font-bold text-2xl'>Profile</h1>
                    </div>

                    <div className="st-profile-container border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-5 p-5 w-111 rounded-md">
                        {/* 4. Use state for Name and Roll No */}
                        <h1 className='font-bold text-xl'>{studentName}</h1>
                        <h1>Roll No: {rollNo}</h1>

                        <div className="confidence-score bg-zinc-800 rounded-md border-2 border-gray-600 p-3 flex justify-center items-center flex-col">
                            <h1 className='font-bold text-xl'>Confidence Trust Score</h1>
                            {/* 5. Use state for Score */}
                            <h1 className='font-bold text-xl text-blue-400'>{confidenceScore} / 10</h1>
                        </div>
                    </div>

                    <div className="st-startus border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-5 p-5 w-111 rounded-md">
                        <h1 className='font-bold text-xl'>Biometric Enrollment Status</h1>
                        <p>Manage your secure identifications methods below.</p>

                        <div className="blk1 flex justify-between bg-zinc-800 p-2 rounded-md border-2 border-gray-600">
                            <h1>Facial Identity (Niqab Friendly)</h1>
                            {/* 6. Conditional text based on state */}
                            <h1 className={isFacialEnrolled ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                {isFacialEnrolled ? 'ENROLLED' : 'NOT ENROLLED'}
                            </h1>
                        </div>

                        <div className="blk2 flex justify-between bg-zinc-800 p-2 rounded-md border-2 border-gray-600">
                            <h1>Fingerprint Data</h1>
                            
                            {/* 7. Show Button only if NOT enrolled, otherwise show ENROLLED text */}
                            {isFingerprintEnrolled ? (
                                <h1 className='text-green-500 font-bold uppercase'>Enrolled</h1>
                            ) : (
                                <button 
                                    onClick={handleFingerprintEnroll}
                                    className='bg-blue-700 flex justify-center w-25 font-bold rounded-sm cursor-pointer hover:bg-blue-900'
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
