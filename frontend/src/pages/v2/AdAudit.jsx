import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const AdAudit = () => {
  const [logs, setLogs] = useState([
    { id: 1, date: "2023-10-01", time: "10:00 AM", name: "Ali Liaqat", description: "Updated User Roles" },
    { id: 2, date: "2023-10-01", time: "11:30 AM", name: "Admin", description: "Deleted Flagged Case #102" },
    { id: 3, date: "2023-10-02", time: "09:15 AM", name: "System", description: "Daily Backup Completed" },
  ]);

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />
      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Admin Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />
        <div className="container h-screen flex flex-col items-start bg-zinc-800 w-full overflow-x-auto">
          <div className="header w-full flex justify-between m-3 p-3">
            <h1 className='font-bold text-lg md:text-2xl'>Audit Logs</h1>
          </div>
          <div className="audit-logs audit-logs-container border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-2 md:m-5 p-3 md:p-5 w-full max-w-full rounded-md overflow-x-auto">
            {logs.map((log) => (
              <div key={log.id} className="log flex flex-col sm:flex-row gap-2 sm:gap-5 md:gap-10 text-sm md:text-base">
                <p>{log.date}</p>
                <p>{log.time}</p>
                <p>{log.name}</p>
                <p>{log.description}</p>
              </div>
            ))}
            <div className="export-btn">
              <button className='bg-blue-700 p-1 w-full sm:w-50 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>
                Download CSV Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdAudit