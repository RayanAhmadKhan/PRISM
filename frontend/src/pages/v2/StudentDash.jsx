import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const StudentDash = () => {
  const [method, setMethod] = useState("Face");
  const [confidence, setConfidence] = useState(96);
  const [isVerifying, setIsVerifying] = useState(false);
  const [history, setHistory] = useState([
    { dates: "12 Mar 2026", course: "DLD", status: "Pending", verified: "No" },
    { dates: "13 Mar 2026", course: "DS", status: "Completed", verified: "Yes" },
    { dates: "14 Mar 2026", course: "OS", status: "In Progress", verified: "No" }
  ]);

  const startVerification = () => {
    setIsVerifying(true);
    setConfidence(Math.floor(Math.random() * (100 - 80 + 1)) + 80);
    setTimeout(() => setIsVerifying(false), 2000);
  };

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Student"} user={"Ghulam Dastgir"} />
      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Student Dashboard"} btn2={"Courses"} btn3={"Attendance History"} btn4={"Profile"} />
        <div className="container h-screen flex flex-col items-start bg-zinc-800 w-full overflow-y-auto">
          <div className="case-container border-2 border-gray-600 flex flex-col gap-5 m-3 md:m-5 bg-zinc-900 p-3 md:p-5 rounded-md w-full max-w-full md:w-150">
            <h1 className='font-bold text-lg md:text-xl'>Mark Attendance</h1>
            <div className="mark-attendance w-full">
              <div className="buttons flex gap-1">
                <button
                  onClick={() => setMethod("Face")}
                  className={`bg-zinc-900 border-2 ${method === "Face" ? 'border-blue-500' : 'border-gray-500'} w-1/2 md:w-70 h-10 hover:cursor-pointer`}
                >
                  Face
                </button>
                <button
                  onClick={() => setMethod("Fingerprint")}
                  className={`bg-zinc-900 border-2 ${method === "Fingerprint" ? 'border-blue-500' : 'border-gray-500'} w-1/2 md:w-70 h-10 hover:cursor-pointer`}
                >
                  Fingerprint
                </button>
              </div>
              <div className="confidence-display py-3 flex flex-col gap-1">
                <h3 className='text-sm md:text-base'>Confidence Level ({method}):</h3>
                <h1 className='font-extrabold text-xl md:text-2xl text-blue-400'>{confidence}%</h1>
                <div className="verify-button">
                  <button
                    onClick={startVerification}
                    className='bg-blue-700 p-1 w-full md:w-140 font-bold rounded-sm cursor-pointer hover:bg-blue-900 disabled:bg-gray-600'
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Start Verification"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="history-container flex flex-col gap-5 m-3 md:m-5 w-full">
            <h1 className='font-bold text-lg md:text-xl'>Attendance History</h1>
            <div className='w-full overflow-x-auto'>
              <Table
                columns={["Dates", "Course", "Status", "Verified"]}
                rows={history}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDash