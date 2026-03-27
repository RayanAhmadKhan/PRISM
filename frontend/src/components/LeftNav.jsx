import React from 'react'
import { Link } from 'react-router-dom'

const LeftNav = (props) => {
    
    // 1. Pass 'btnLabel' as an argument so the function knows which button is calling it
    const getNavPath = (btnLabel) => {
        // 2. Use a Mapping object (much cleaner than multiple if/else)
        // Ensure these match your <Route path='...'> from the screenshot exactly!
        const paths = {
            "Student Dashboard": "/pages/v2/StudentDash",
            "Teacher Dashboard": "/pages/v2/TeacherDash",
            "Admin Dashboard":   "/pages/v2/AdminDash",

            // student dash buttons
            "Courses":           "/pages/v2/Course",
            "Attendance History":        "/pages/v2/StAttendance",
            "Profile":           "/pages/v2/StProfile",

            // teacher dash buttons
            "Attendance Record":        "/pages/v2/TchAttendance",
            "Flagged Cases":        "/pages/v2/TchCase",
            "Profile Settings":           "/pages/v2/TchProfile",

            // admin dash buttons
            "User Management":        "/pages/v2/AdManagement",
            "Audit Logs":        "/pages/v2/AdAudit",
            "Settings":           "/pages/v2/AdSettings"
        };

        // Return the matched path, or a default "/" if not found
        return paths[btnLabel] || "/";
    }

    return (
        <div className="left-nav w-[15%] flex items-center justify-start py-6 gap-10 flex-col bg-zinc-900 h-screen">
            
            {/* 3. Pass the specific prop into the function call */}
            <Link to={getNavPath(props.btn1)} className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>
                {props.btn1}
            </Link>

            <Link to={getNavPath(props.btn2)} className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>
                {props.btn2}
            </Link>

            <Link to={getNavPath(props.btn3)} className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>
                {props.btn3}
            </Link>

            <Link to={getNavPath(props.btn4)} className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>
                {props.btn4}
            </Link>
            
        </div>
    )
}

export default LeftNav
