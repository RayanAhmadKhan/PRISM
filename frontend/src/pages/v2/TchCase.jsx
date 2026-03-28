import React, { useState } from 'react' // 1. Import useState
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const TchCase = () => {
  // 2. Define state with an array of flagged case objects
  const [flaggedCases, setFlaggedCases] = useState([
    { id: 1, name: "Zain Malik", roll: "23L-XXXX", reason: "Face match 45% (Niqab / Mask detected)" },
    { id: 2, name: "Hassan Ali", roll: "23L-YYYY", reason: "Multiple faces detected in frame" },
  ]);

  // 3. Logic to remove a case once handled
  const handleAction = (id, actionType) => {
    console.log(`${actionType}ing case ID: ${id}`);
    // Filter out the case that was just acted upon
    setFlaggedCases(prevCases => prevCases.filter(c => c.id !== id));
  };

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>Flagged Cases ({flaggedCases.length})</h1>
          </div>

          {/* 4. Map through the cases in state */}
          {flaggedCases.length > 0 ? (
            flaggedCases.map((item) => (
              <div key={item.id} className="case w-7xl flex justify-between items-center m-3 p-3 bg-zinc-900 rounded-md border-2 border-gray-600">
                <div className="content flex flex-col">
                  <h1 className='font-bold text-xl'>Student: {item.name} ({item.roll})</h1>
                  <p className='text-red-500'>Reason: {item.reason} - Manual Verification Required</p>
                </div>

                <div className="buttons flex gap-3 p-7">
                  {/* 5. Attach click handlers to buttons */}
                  <button 
                    onClick={() => handleAction(item.id, "Verify")}
                    className='bg-blue-700 w-20 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900'
                  >
                    Verify
                  </button>

                  <button 
                    onClick={() => handleAction(item.id, "Report")}
                    className='bg-red-600 w-20 h-10 font-bold rounded-sm cursor-pointer hover:bg-red-800'
                  >
                    Report
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="m-5 text-gray-400 italic">No flagged cases remaining.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TchCase
