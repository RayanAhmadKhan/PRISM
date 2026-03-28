import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const StAttendance = () => {
    return (
        <div className='min-h-dvh w-full'>
            <Navbar title={"Student"} user={"Ghulam Dastgir"} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Student Dashboard"} btn2={"Courses"} btn3={"Attendance History"} btn4={"Profile"} />

                <div className="container h-screen flex flex-col items-start bg-zinc-800">
                    <div className="header w-7xl flex justify-between m-3 p-3">
                        <h1 className='font-bold text-2xl'>Attendance Record</h1>

                        <button className='bg-blue-700 p-1 w-45 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Download PDF Report</button>
                    </div>

                    <div className="w-7xl p-5">
                        <Table
                            columns={["Date", "Course", "Confidence", "Status"]}
                            rows={[
                                { date: "12 Mar", course: "DLD", confidence: "80%", status: "Pending" },
                                { date: "13 Mar", course: "DS", confidence: "65%", status: "Approved" }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StAttendance
