import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const TeacherDashboard = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col bg-zinc-800">
          <div className="case-container flex flex-col gap-5 m-5">
            <h1 className='font-bold text-xl'>Flagged Cases</h1>
            <Table col1={"Name"} col2={"Face Match"} col3={"Student ID"} col4={"Actions"} />
          </div>

          <div className="session-container flex flex-col gap-5 m-5">
            <h1 className='font-bold text-xl'>Session Management</h1>
            <Table col1={"Date"} col2={"Course"} col3={"Section"} col4={"Time"} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
