import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import { useForm } from 'react-hook-form'

const TchProfile = () => {
  const [statusMessage, setStatusMessage] = useState("");
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "Aamer Raheem",
      email: "aamer.raheem@university.edu",
      id: "TCH-9921",
      department: "Computer Science"
    }
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    setStatusMessage("Settings updated successfully!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />
      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />
        <div className="container h-screen flex flex-col items-start bg-zinc-800 w-full overflow-y-auto">
          <div className="header w-full flex flex-col sm:flex-row justify-between m-3 p-3 gap-3 sm:gap-0">
            <h1 className='font-bold text-lg md:text-2xl'>Profile Settings</h1>
            {statusMessage && (
              <p className="bg-green-600 text-white px-4 py-2 rounded-md font-bold animate-pulse text-sm md:text-base">
                {statusMessage}
              </p>
            )}
          </div>
          <div className="case w-full max-w-full md:w-140 flex justify-center items-center m-3 p-3 bg-zinc-900 rounded-md border-2 border-gray-600">
            <div className="profile-form w-full">
              <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 md:gap-10 justify-center items-center w-full'>
                <div className="input-field w-full flex flex-col sm:flex-row justify-center items-start sm:items-center gap-2 sm:gap-16">
                  <label htmlFor="name" className='font-bold text-base md:text-xl sm:w-28 sm:text-right'>Name</label>
                  <input {...register("name")} type="text" placeholder='Name' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-full sm:w-100' />
                </div>
                <div className="input-field w-full flex flex-col sm:flex-row justify-center items-start sm:items-center gap-2 sm:gap-18">
                  <label htmlFor="email" className='font-bold text-base md:text-xl sm:w-28 sm:text-right'>Email</label>
                  <input {...register("email")} type="email" placeholder='Email' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-full sm:w-100' />
                </div>
                <div className="input-field w-full flex flex-col sm:flex-row justify-center items-start sm:items-center gap-2 sm:gap-2">
                  <label htmlFor="id" className='font-bold text-base md:text-xl sm:w-28 sm:text-right'>Employee ID</label>
                  <input {...register("id")} type="text" placeholder='Employee ID' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-full sm:w-100' />
                </div>
                <div className="input-field w-full flex flex-col sm:flex-row justify-center items-start sm:items-center gap-2 sm:gap-3">
                  <label htmlFor="department" className='font-bold text-base md:text-xl sm:w-28 sm:text-right'>Department</label>
                  <input {...register("department")} type="text" placeholder='Department' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-full sm:w-100' />
                </div>
                <button type="submit" className="bg-blue-600 px-6 py-2 rounded-md font-bold cursor-pointer hover:bg-blue-900 w-full sm:w-auto">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TchProfile