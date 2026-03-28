import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const AdManagement = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Admin Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>User Management</h1>

            <div className="side-btns flex justify-center items-center gap-3">
              <input type="text" placeholder='Search by name or ID...' className='bg-zinc-900 p-2 w-47 font-bold rounded-sm border-2 border-gray-600' />

              <button className='bg-blue-700 w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Add New User</button>
            </div>
          </div>

          <div className="p-5 w-7xl">
            <Table
              columns={["Name", "Role", "Status", "Action"]}
              rows={[
                { name: "Ali Khan", role: "Student", status: "Active", action: "Pending" },
                { name: "Ahmad Riaz", role: "Teacher", status: "Inactive", action: "Approved" }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdManagement
