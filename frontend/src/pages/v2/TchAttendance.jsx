import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const TchAttendance = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>Attendance Record</h1>

            <input type="text" placeholder='Search Student ID' className='bg-zinc-900 p-2 w-40 font-bold rounded-sm border-2 border-gray-600' />
          </div>

          <div className="flex flex-col m-5 gap-5">
            <Table
              columns={["Date", "Student Name", "ID", "Method", "Status"]}
              rows={[
                { date: "12 Mar 2026", studentName: "Ali Khan", id: "STD101", method: "Online", status: "Approved" },
                { date: "13 Mar 2026", studentName: "Ahmed Raza", id: "STD102", method: "Physical", status: "Pending" },
                { date: "14 Mar 2026", studentName: "Usman Tariq", id: "STD103", method: "Online", status: "Rejected" }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TchAttendance
