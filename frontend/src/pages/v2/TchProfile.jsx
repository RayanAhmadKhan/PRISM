import React, { useState } from 'react' // 1. Import useState
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import { useForm } from 'react-hook-form'

const TchProfile = () => {
  // 2. State for feedback message
  const [statusMessage, setStatusMessage] = useState("");

  const { register, handleSubmit } = useForm({
    // Optional: Set dummy initial values
    defaultValues: {
      name: "Aamer Raheem",
      email: "aamer.raheem@university.edu",
      id: "TCH-9921",
      department: "Computer Science"
    }
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    // 3. Update state to show success
    setStatusMessage("Settings updated successfully!");
    
    // Hide message after 3 seconds
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Teacher"} user={"Aamer Raheem"} />

      <div className="body bg-zinc-900 flex">
        <LeftNav btn1={"Teacher Dashboard"} btn2={"Attendance Record"} btn3={"Flagged Cases"} btn4={"Profile Settings"} />

        <div className="container h-screen flex flex-col items-start bg-zinc-800">
          <div className="header w-7xl flex justify-between m-3 p-3">
            <h1 className='font-bold text-2xl'>Profile Settings</h1>
            
            {/* 4. Display the status message if it exists */}
            {statusMessage && (
              <p className="bg-green-600 text-white px-4 py-2 rounded-md font-bold animate-pulse">
                {statusMessage}
              </p>
            )}
          </div>

          <div className="case w-140 flex justify-center items-center m-3 p-3 bg-zinc-900 rounded-md border-2 border-gray-600">
            <div className="profile-form">
              <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-10 justify-center items-center'>

                <div className="input-field flex justify-center items-center gap-16">
                  <label htmlFor="name" className='font-bold text-xl'>Name</label>
                  <input {...register("name")} type="text" placeholder='Name' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

                <div className="input-field flex justify-center items-center gap-18">
                  <label htmlFor="email" className='font-bold text-xl'>Email</label>
                  <input {...register("email")} type="email" placeholder='Email' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

                <div className="input-field flex justify-center items-center gap-2">
                  <label htmlFor="id" className='font-bold text-xl'>Employee ID</label>
                  <input {...register("id")} type="text" placeholder='Employee ID' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

                <div className="input-field flex justify-center items-center gap-3">
                  <label htmlFor="department" className='font-bold text-xl'>Department</label>
                  <input {...register("department")} type="text" placeholder='Department' className='bg-zinc-800 rounded-md border-2 border-gray-600 p-2 w-100' />
                </div>

                <button type="submit" className="bg-blue-600 px-6 py-2 rounded-md font-bold cursor-pointer hover:bg-blue-900">
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
