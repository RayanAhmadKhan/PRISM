import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const AdSettings = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Admin Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>Settings</h1>
          </div>

          <div className="main-container p-5 flex flex-col gap-5">
            <div className="con01 flex flex-col gap-5 p-5 bg-zinc-900 border-2 border-gray-600 rounded-md">
              <h1 className='font-bold text-xl'>AI Recognition Config</h1>
              <h1>Face Match Sensitivity (0-100)</h1>
              <input type="text" className='bg-zinc-800 p-1 border-2 border-gray-600 rounded-md' />
              <p className='text-yellow-200'>Higher values reduce false positives but may increase regections rates.</p>

              <div className="checkbox flex gap-5">
                <label htmlFor="checkbox">Enable Niqab-Friendly Detection</label>
                <input type="checkbox" name='checkbox' />
              </div>
            </div>

            <div className="con02 flex flex-col gap-5 p-5 bg-zinc-900 border-2 border-gray-600 rounded-md">
              <h1 className='font-bold text-xl'>Security & Access</h1>
              <h1>Default Session Timeout (Minutes)</h1>
              <input type="text" className='bg-zinc-800 p-1 border-2 border-gray-600 rounded-md' />

              <div className="checkbox flex gap-5">
                <label htmlFor="checkbox">Require Admin MFA for User Detection</label>
                <input type="checkbox" name='checkbox' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdSettings
