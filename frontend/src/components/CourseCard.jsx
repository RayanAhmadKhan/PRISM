import React from 'react'

const CourseCards = () => {
    return (
        <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition duration-300 m-5 p-6 w-60 h-auto flex flex-col justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-300 mb-2">
                    Object Oriented Programming
                </h1>
                <p className="text-gray-400 font-medium">Dr. Hamza | CS-201</p>
            </div>

            <div className="bg-linear-to-r from-blue-900 to-blue-800 rounded-md p-3 border border-blue-600">
                <h1 className="text-lg font-semibold text-blue-200">Attendance: <span className="text-green-400">95%</span></h1>
            </div>

            <button className="w-full px-4 py-3 font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-200 shadow-lg hover:shadow-blue-500/50">
                View Details
            </button>
        </div>
    )
}

export default CourseCards
