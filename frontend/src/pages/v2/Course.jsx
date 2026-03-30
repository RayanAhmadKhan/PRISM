import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'
import CourseCard from '../../components/CourseCard'

const Course = () => {
    const [courses, setCourses] = useState([
        { id: 1, title: "Data Structures", code: "CS201", instructor: "Dr. Ali" },
        { id: 2, title: "Operating Systems", code: "CS302", instructor: "Ms. Sarah" },
        { id: 3, title: "Database Systems", code: "CS401", instructor: "Mr. Ahmed" },
        { id: 4, title: "Web Development", code: "CS105", instructor: "Dr. Usman" }
    ]);

    return (
        <div className='min-h-dvh w-full'>
            <Navbar title={"Student"} user={"Ghulam Dastgir"} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Student Dashboard"} btn2={"Courses"} btn3={"Attendance History"} btn4={"Profile"} />

                <div className="container h-screen flex flex-col items-start bg-zinc-800">
                    <div className="header w-7xl flex justify-between m-3 p-3">
                        <h1 className='font-bold text-2xl'>Courses</h1>

                        <button className='bg-blue-700 p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>
                            Start Verification
                        </button>
                    </div>

                    <div className="cards grid grid-cols-2 gap-4 p-3">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                title={course.title}
                                code={course.code}
                                instructor={course.instructor}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Course
