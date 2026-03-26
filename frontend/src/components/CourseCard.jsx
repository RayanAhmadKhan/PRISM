import React from 'react'

const CourseCards = () => {
    return (
        <div className="card bg-zinc-900 flex flex-col justify-between m-5 p-5 w-150 h-50 rounded-md border-2 border-gray-600">
            <h1 className='font-bold text-xl text-blue-500'>Object Oriented Programming</h1>
            <p>Dr. Hamza | CS-201</p>

            <div className="attendance">
                <h1>Attendance: 95%</h1>
            </div>

            <div className="button">
                <button className='bg-blue-700 p-1 w-35 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>View Details</button>
            </div>
        </div>
    )
}

export default CourseCards
