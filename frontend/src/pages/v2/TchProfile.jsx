import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const TchProfile = () => {
  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>Profile Settings</h1>
          </div>

          <div className="case w-140 flex justify-center items-center m-3 p-3 bg-zinc-900 rounded-md border-2 border-gray-600">
            <div className="profile-form">
              <form action="" className='flex flex-col gap-10 justify-center items-center'>
                <div className="input-field flex justify-center items-center gap-16">
                  <label htmlFor="name" className='font-bold text-xl'>Name</label>
                  <input name='name' type="text" placeholder='Name' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

                <div className="input-field flex justify-center items-center gap-18">
                  <label htmlFor="email" className='font-bold text-xl'>Email</label>
                  <input name='email' type="email" placeholder='Email' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

                <div className="input-field flex justify-center items-center gap-2">
                  <label htmlFor="id" className='font-bold text-xl'>Employee ID</label>
                  <input name='id' type="text" placeholder='Employee ID' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

                <div className="input-field flex justify-center items-center gap-3">
                  <label htmlFor="department" className='font-bold text-xl'>Department</label>
                  <input name='department' type="text" placeholder='Department' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TchProfile
