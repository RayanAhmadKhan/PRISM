import React from 'react'

const Navbar = (props) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = "/login";
    }
    return (
        <div className="w-full bg-linear-to-r from-blue-950 to-blue-900 flex flex-col sm:flex-row justify-between items-center px-4 py-4 md:px-8 md:py-5 sticky top-0 z-50 border-b-2 border-gray-600 shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-300">
                PRISM | {props.title} Panel
            </h1>

            <div className="flex justify-center items-center gap-6">
                <p className="font-semibold text-gray-300 text-base md:text-lg">{props.user}</p>

                <button 
                    className="px-6 py-2 font-semibold text-white bg-linear-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition duration-200 shadow-lg hover:shadow-red-500/50"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Navbar
