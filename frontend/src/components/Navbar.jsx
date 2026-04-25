import React from 'react'

const Navbar = (props) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = "/login";
    }
    return (
        <div className="nav flex justify-between bg-blue-950 items-center p-5 sticky top-0 z-10">
            <h1 className='font-bold text-xl'>PRISM | {props.title} Panel</h1>

            <div className="right flex justify-center items-center gap-5">
                <p className='font-bold'>{props.user}</p>

                <button className='bg-blue-700 px-3 py-1 w-20 font-bold rounded-sm cursor-pointer hover:bg-red-800' onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Navbar
