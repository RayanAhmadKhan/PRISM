import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const AdAudit = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Admin Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>Audit Logs</h1>
          </div>

          <div className="audit-logs audit-logs-container border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-5 p-5 w-7xl rounded-md">

            <div className="log flex gap-10">
              <p>[DATE]</p>
              <p>[TIME]</p>
              <p>[NAME]</p>
              <p>[DESCRIPTION]</p>
            </div>

            <div className="log flex gap-10">
              <p>[DATE]</p>
              <p>[TIME]</p>
              <p>[NAME]</p>
              <p>[DESCRIPTION]</p>
            </div>

            <div className="export-btn">
              <button className='bg-blue-700 p-1 w-50 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Download CSV Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdAudit
