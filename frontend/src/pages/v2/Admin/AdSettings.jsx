import React, { useState } from 'react'
import Navbar from '../../../components/Navbar'
import LeftNav from '../../../components/LeftNav'

const AdSettings = () => {
  const [faceSensitivity, setFaceSensitivity] = useState(75);
  const [niqabFriendly, setNiqabFriendly] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [requireMFA, setRequireMFA] = useState(false);

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />
      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Admin Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />
        <div className="container h-screen flex flex-col items-start bg-zinc-800 w-full overflow-y-auto">
          <div className="header w-full flex justify-between m-3 p-3">
            <h1 className='font-bold text-lg md:text-2xl'>Settings</h1>
          </div>
          <div className="main-container p-3 md:p-5 flex flex-col gap-5 w-full">
            <div className="con01 flex flex-col gap-5 p-3 md:p-5 bg-zinc-900 border-2 border-gray-600 rounded-md w-full">
              <h1 className='font-bold text-lg md:text-xl'>AI Recognition Config</h1>
              <h1 className='text-sm md:text-base'>Face Match Sensitivity (0-100): <strong>{faceSensitivity}</strong></h1>
              <input
                type="number"
                value={faceSensitivity}
                onChange={(e) => setFaceSensitivity(e.target.value)}
                className='bg-zinc-800 p-1 border-2 border-gray-600 rounded-md w-full sm:w-auto'
              />
              <p className='text-yellow-200 text-sm md:text-base'>Higher values reduce false positives but may increase rejections rates.</p>
              <div className="checkbox flex gap-3 md:gap-5 items-center flex-wrap">
                <label htmlFor="niqab" className='text-sm md:text-base'>Enable Niqab-Friendly Detection</label>
                <input
                  type="checkbox"
                  id='niqab'
                  checked={niqabFriendly}
                  onChange={(e) => setNiqabFriendly(e.target.checked)}
                />
              </div>
            </div>
            <div className="con02 flex flex-col gap-5 p-3 md:p-5 bg-zinc-900 border-2 border-gray-600 rounded-md w-full">
              <h1 className='font-bold text-lg md:text-xl'>Security & Access</h1>
              <h1 className='text-sm md:text-base'>Default Session Timeout (Minutes)</h1>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className='bg-zinc-800 p-1 border-2 border-gray-600 rounded-md w-full sm:w-auto'
              />
              <div className="checkbox flex gap-3 md:gap-5 items-center flex-wrap">
                <label htmlFor="mfa" className='text-sm md:text-base'>Require Admin MFA for User Detection</label>
                <input
                  type="checkbox"
                  id='mfa'
                  checked={requireMFA}
                  onChange={(e) => setRequireMFA(e.target.checked)}
                />
              </div>
            </div>
            <button
              onClick={() => console.log({ faceSensitivity, niqabFriendly, sessionTimeout, requireMFA })}
              className='bg-blue-700 p-2 rounded-md font-bold hover:bg-blue-900 w-full sm:w-auto'
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdSettings