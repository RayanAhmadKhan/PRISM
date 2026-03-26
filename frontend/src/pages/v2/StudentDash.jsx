import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const StudentDash = () => {
    return (
        <div className='min-h-dvh w-full'>
            <Navbar title={"Student"} user={"Ghulam Dastgir"} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Dashboard"} btn2={"Courses"} btn3={"Attendance Record"} btn4={"Profile"} />

                <div className="container h-screen flex flex-col items-start bg-zinc-800">
                    <div className="case-container border-2 border-gray-600 flex flex-col gap-5 m-5 bg-zinc-900 p-5 rounded-md w-150">
                        <h1 className='font-bold text-xl'>Mark Attendance</h1>

                        <div className="mark-attendance w-300">
                            <div className="buttons flex gap-1">
                                <button className='bg-zinc-900 border-2 border-gray-500 hover:border-blue-900 w-70 h-10 hover:cursor-pointer'>Face</button>
                                <button className='bg-zinc-900 border-2 border-gray-500 hover:border-blue-900 w-70 h-10 hover:cursor-pointer'>Fingerprint</button>
                            </div>

                            <div className="confidence-display py-3 flex flex-col gap-1">
                                <h3>Confidence Level:</h3>
                                <h1 className='font-extrabold text-2xl text-blue-400'>96%</h1>

                                <div className="verify-button">
                                    <button className='bg-blue-700 p-1 w-140 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Start Verification</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="history-container flex flex-col gap-5 m-5">
                        <h1 className='font-bold text-xl'>Attendance History</h1>

                        <Table col1={"Dates"} col2={"Course"} col3={"Status"} col4={"Verified"} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentDash
