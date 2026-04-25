import React, { useState } from 'react'
import Navbar from '../../../components/Navbar'
import LeftNav from '../../../components/LeftNav'

const TchCase = () => {
  const [flaggedCases, setFlaggedCases] = useState([
    { id: 1, name: "Zain Malik", roll: "23L-XXXX", reason: "Face match 45% (Niqab / Mask detected)" },
    { id: 2, name: "Hassan Ali", roll: "23L-YYYY", reason: "Multiple faces detected in frame" },
  ]);

  const handleAction = (id, actionType) => {
    console.log(`${actionType}ing case ID: ${id}`);
    setFlaggedCases(prevCases => prevCases.filter(c => c.id !== id));
  };

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />
      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />
        <div className="container h-screen flex flex-col items-start bg-zinc-800 w-full overflow-y-auto">
          <div className="header w-full flex justify-between m-3 p-3">
            <h1 className='font-bold text-lg md:text-2xl'>Flagged Cases ({flaggedCases.length})</h1>
          </div>
          {flaggedCases.length > 0 ? (
            flaggedCases.map((item) => (
              <div key={item.id} className="case w-full flex flex-col sm:flex-row justify-between items-start sm:items-center m-3 p-3 bg-zinc-900 rounded-md border-2 border-gray-600 gap-3 sm:gap-0">
                <div className="content flex flex-col gap-1">
                  <h1 className='font-bold text-base md:text-xl'>Student: {item.name} ({item.roll})</h1>
                  <p className='text-red-500 text-sm md:text-base'>Reason: {item.reason} - Manual Verification Required</p>
                </div>
                <div className="buttons flex gap-3 p-3 md:p-7 w-full sm:w-auto">
                  <button
                    onClick={() => handleAction(item.id, "Verify")}
                    className='bg-blue-700 w-full sm:w-20 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900'
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "Report")}
                    className='bg-red-600 w-full sm:w-20 h-10 font-bold rounded-sm cursor-pointer hover:bg-red-800'
                  >
                    Report
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="m-5 text-gray-400 italic text-sm md:text-base">No flagged cases remaining.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TchCase