import React from 'react'

const TeacherDashboard = () => {
  return (
    <div className='min-h-dvh w-full bg-blue-950'>
      <div className="nav flex justify-between items-center p-5">
        <h1 className='font-bold text-xl'>PRISM | Teacher Panel</h1>

        <div className="right flex justify-center items-center gap-5">
          <p className='font-bold'>Dr. Ahmad Riaz</p>

          <button className='bg-blue-700 px-3 py-1 w-20 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Logout</button>
        </div>
      </div>

      <div className="body bg-zinc-900 flex">
        <div className="left-dash w-[15%] flex items-center justify-start py-6 gap-5 flex-col bg-zinc-900">
          <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Dashboard</button>
          <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Attendance Record</button>
          <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Flagged Cases</button>
          <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Profile Settings</button>
        </div>

        <div className="container h-screen flex flex-col items-center bg-zinc-800">
          <div className="case-container flex flex-col gap-5 m-5">
            <h1 className='font-bold text-xl'>Flagged Cases</h1>

            <div className="table01 w-300">
              <table className='bg-zinc-900 flex flex-col gap-3 p-5 rounded-md'>
                <tr className='flex gap-61'>
                  <th>Name</th>
                  <th>Face Match</th>
                  <th>Student ID</th>
                  <th>Actions</th>
                </tr>
                <tr className='flex gap-64'>
                  <td>Aisha Khan</td>
                  <td>75%</td>
                  <td>23L-XXXX</td>
                  <td className='flex gap-3'>
                    <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                    <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                  </td>
                </tr >
                <tr className='flex gap-64'>
                  <td>Aisha Khan</td>
                  <td>75%</td>
                  <td>23L-XXXX</td>
                  <td className='flex gap-3'>
                    <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                    <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                  </td>
                </tr >
                <tr className='flex gap-64'>
                  <td>Aisha Khan</td>
                  <td>75%</td>
                  <td>23L-XXXX</td>
                  <td className='flex gap-3'>
                    <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                    <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                  </td>
                </tr >
              </table>

            </div>
          </div>

          <div className="session-container flex flex-col gap-5 m-5">
            <h1 className='font-bold text-xl'>Session Management</h1>

            <div className="table02 w-300">
              <table className='bg-zinc-900 flex flex-col gap-3 p-5 rounded-md'>
                <tr className='flex gap-67'>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Section</th>
                  <th>Time</th>
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

export default TeacherDashboard
