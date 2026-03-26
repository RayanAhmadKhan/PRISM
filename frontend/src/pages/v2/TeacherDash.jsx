import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const TeacherDashboard = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col bg-zinc-800">
          <div className="case-container flex flex-col gap-5 m-5">
            <h1 className='font-bold text-xl'>Flagged Cases</h1>

            <div className="table01 w-300">
              <table className='bg-zinc-900 border-2 border-gray-600 flex flex-col gap-3 p-5 rounded-md'>
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
              <table className='bg-zinc-900 border-2 border-gray-600 flex flex-col gap-3 p-5 rounded-md'>
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
