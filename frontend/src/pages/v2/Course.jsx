import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import CourseCard from '../../components/CourseCard'

const Course = () => {
    return (
        <div className='min-h-dvh w-full'>
            <Navbar title={"Student"} user={"Ghulam Dastgir"} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Student Dashboard"} btn2={"Courses"} btn3={"Attendance History"} btn4={"Profile"} />

                <div className="container h-screen flex flex-col items-start bg-zinc-800">
                    <div className="header w-7xl flex justify-between m-3 p-3">
                        <h1 className='font-bold text-2xl'>Courses</h1>

                        <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Start Verification</button>
                    </div>

                    <div className="cards grid grid-cols-2">
                        <CourseCard />
                        <CourseCard />
                        <CourseCard />
                        <CourseCard />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Course
