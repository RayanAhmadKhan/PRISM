import React from 'react'

const StudentDash = () => {
    return (
        <div className='min-h-dvh w-full'>
            <div className="nav flex justify-between bg-blue-950 items-center p-5 sticky top-0 z-10">
                <h1 className='font-bold text-xl'>PRISM | Student Portal</h1>

                <div className="right flex justify-center items-center gap-5">
                    <p className='font-bold'>Ghulam Dastgir</p>

                    <button className='bg-blue-700 px-3 py-1 w-20 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Logout</button>
                </div>
            </div>

            <div className="body bg-zinc-900 flex">
                <div className="left-dash w-[15%] flex items-center justify-start py-6 gap-5 flex-col bg-zinc-900">
                    <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Dashboard</button>
                    <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Courses</button>
                    <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Attendance Record</button>
                    <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Profile</button>
                </div>

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

                        <div className="table02 w-300">
                            <table className='bg-zinc-900 flex flex-col gap-3 p-5 rounded-md'>
                                <tr className='flex gap-67'>
                                    <th>Date</th>
                                    <th>Course</th>
                                    <th>Status</th>
                                    <th>Verified</th>
                                </tr>
                                <tr className='flex gap-64'>
                                    <td>Aisha Khan</td>
                                    <td>75%</td>
                                    <td>23L-XXXX</td>
                                    <td className='flex gap-3'>8:00</td>
                                </tr >
                                <tr className='flex gap-64'>
                                    <td>Aisha Khan</td>
                                    <td>75%</td>
                                    <td>23L-XXXX</td>
                                    <td className='flex gap-3'>9:00</td>
                                </tr >
                                <tr className='flex gap-64'>
                                    <td>Aisha Khan</td>
                                    <td>75%</td>
                                    <td>23L-XXXX</td>
                                    <td className='flex gap-3'>7:00</td>
                                </tr >

                                <div className="session-btn my-5">
                                    <button className='bg-blue-700 p-1 w-40 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Add New Session</button>
                                </div>
                            </table>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentDash
