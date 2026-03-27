import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const TeacherDashboard = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col bg-zinc-800">
          <div className="case-container flex flex-col gap-5 m-5">
            <h1 className='font-bold text-xl'>Flagged Cases</h1>
            <Table
              columns={["Name", "Face Match", "Student ID", "Actions"]}
              rows={[
                { name: "Ali Khan", faceMatch: "Matched", studentId: "STD101", actions: "View" },
                { name: "Ahmed Raza", faceMatch: "Not Matched", studentId: "STD102", actions: "Review" },
                { name: "Usman Tariq", faceMatch: "Matched", studentId: "STD103", actions: "View" }
              ]}
            />
          </div>

          <div className="session-container flex flex-col gap-5 m-5">
            <h1 className='font-bold text-xl'>Session Management</h1>
            <Table
              columns={["Date", "Course", "Section", "Time"]}
              rows={[
                { date: "12 Mar 2026", course: "DLD", section: "A", time: "10:00 AM" },
                { date: "13 Mar 2026", course: "DS", section: "B", time: "12:00 PM" },
                { date: "14 Mar 2026", course: "OS", section: "A", time: "02:00 PM" }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
