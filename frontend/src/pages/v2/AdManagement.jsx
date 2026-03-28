import React, { useState } from 'react' // 1. Import useState
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const AdManagement = () => {
  // 2. State for the search input text
  const [searchTerm, setSearchTerm] = useState("");

  // 3. State for the user data (dummy values)
  const [users, setUsers] = useState([
    { name: "Ali Khan", role: "Student", status: "Active", action: "Pending" },
    { name: "Ahmad Riaz", role: "Teacher", status: "Inactive", action: "Approved" },
    { name: "Sara Ahmed", role: "Admin", status: "Active", action: "Approved" }
  ]);

  // 4. Logic to filter users based on what's typed in the search bar
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Admin Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>User Management</h1>

            <div className="side-btns flex justify-center items-center gap-3">
              {/* 5. Connect input to searchTerm state */}
              <input 
                type="text" 
                placeholder='Search by name or ID...' 
                className='bg-zinc-900 p-2 w-47 font-bold rounded-sm border-2 border-gray-600'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button className='bg-blue-700 w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Add New User</button>
            </div>
          </div>

          <div className="p-5 w-7xl">
            {/* 6. Pass the filtered list to the Table */}
            <Table
              columns={["Name", "Role", "Status", "Action"]}
              rows={filteredUsers}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdManagement
