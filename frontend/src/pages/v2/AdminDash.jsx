import React, { useState } from 'react' // 1. Import useState
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import Table from '../../components/Table'

const AdminDash = () => {
    // 2. State for Users Table
    const [users, setUsers] = useState([
        { name: "Ali Khan", role: "Student", status: "Active", action: "View" },
        { name: "Ahmed Raza", role: "Teacher", status: "Inactive", action: "Manage" },
        { name: "Usman Tariq", role: "Admin", status: "Active", action: "Edit" }
    ]);

    // 3. State for Audit Logs
    const [logs, setLogs] = useState([
        { id: 1, text: "Ad Alex: Add User: Abdullah" },
        { id: 2, text: "Ad Alex: Add User: Abdullah" }
    ]);

    return (
        <div className='min-h-dvh w-full'>
            <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Admin Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />

                <div className="container h-screen flex flex-col bg-zinc-800">
                    <div className="case-container flex flex-col gap-5 m-5">
                        <h1 className='font-bold text-xl'>User Management</h1>

                        {/* 4. Pass the users state to the Table */}
                        <Table
                            columns={["Name", "Role", "Status", "Action"]}
                            rows={users}
                        />
                    </div>

                    <div className="audit-logs-container border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-5 p-5 w-111 rounded-md">
                        <h1 className='font-bold text-xl'>Audit Logs</h1>

                        <div className="logs-list flex flex-col gap-2">
                            {/* 5. Map through logs state */}
                            {logs.map((log) => (
                                <div key={log.id} className="logs">
                                    <p>{log.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="export-btn">
                            <button className='bg-blue-700 p-1 w-100 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>
                                Export Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDash
