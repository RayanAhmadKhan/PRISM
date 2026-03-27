import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const TchCase = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>Flagged Cases</h1>
          </div>

          <div className="case w-7xl flex justify-between items-center m-3 p-3 bg-zinc-900 rounded-md border-2 border-gray-600">
            <div className="content flex flex-col">
              <h1 className='font-bold text-xl'>Student: Zain Malik (23L-XXXX)</h1>

              <p className='text-red-500'>Reason: Face match 45% (Niqb / Mask detected - Manual Verification Required)</p>
            </div>

            <div className="buttons flex gap-3 p-7">
              <button className='bg-blue-700 w-20 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Verify</button>

              <button className='bg-red-600 w-20 h-10 font-bold rounded-sm cursor-pointer hover:bg-red-800'>Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TchCase
