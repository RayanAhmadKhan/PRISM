import React from 'react'
import { Link } from 'react-router-dom'

const LeftNav = (props) => {
    
    const getNavPath = (btnLabel) => {
        const paths = {
            "Student Dashboard": "/pages/v2/StudentDash",
            "Teacher Dashboard": "/pages/v2/TeacherDash",
            "Admin Dashboard":   "/pages/v2/Admin/AdminDash",

            // student dash buttons
            "Courses":           "/pages/v2/Course",
            "Attendance History":        "/pages/v2/StAttendance",
            "Profile":           "/pages/v2/StProfile",

            // teacher dash buttons
            "Attendance Record":        "/pages/v2/TchAttendance",
            "Profile Settings":           "/pages/v2/TchProfile",

            // admin dash buttons (internal navigation)
            "User Management":   "admin-users",
            "Course Management": "admin-courses",
            "Section Management": "admin-sections",
            "Attendance/QA":     "admin-attendance"
        };

        return paths[btnLabel] || "/";
    }

    const handleButtonClick = (btnLabel) => {
        // Handle Flagged Cases specially since it's used in both teacher and admin contexts
        if (btnLabel === "Flagged Cases") {
            if (props.onTabChange) {
                // Admin context - use internal tab navigation
                props.onTabChange('flagged');
            } else {
                // Teacher context - navigate to teacher flagged cases page
                window.location.href = "/pages/v2/TchCase";
            }
            return;
        }

        const path = getNavPath(btnLabel);
        
        // Check if it's an internal admin navigation
        if (path.startsWith('admin-') && props.onTabChange) {
            // Extract tab name and call callback
            const tabMap = {
                'admin-users': 'users',
                'admin-courses': 'courses',
                'admin-sections': 'sections',
                'admin-attendance': 'attendance'
            };
            props.onTabChange(tabMap[path]);
        } else if (btnLabel === "Admin Dashboard" && props.onTabChange) {
            // Handle Admin Dashboard button to go to overview
            props.onTabChange('overview');
        }
    }

    return (
        <div className="left-nav w-[15%] flex items-center justify-start py-6 gap-6 flex-col bg-zinc-900 h-screen border-r-2 border-gray-600 overflow-y-auto">
            
            <button 
                onClick={() => handleButtonClick(props.btn1)}
                className='bg-blue-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white transition'
            >
                {props.btn1}
            </button>

            <button 
                onClick={() => handleButtonClick(props.btn2)}
                className='bg-blue-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white transition'
            >
                {props.btn2}
            </button>

            <button 
                onClick={() => handleButtonClick(props.btn3)}
                className='bg-blue-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white transition'
            >
                {props.btn3}
            </button>

            <button 
                onClick={() => handleButtonClick(props.btn4)}
                className='bg-blue-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white transition'
            >
                {props.btn4}
            </button>

            {props.btn5 && (
                <button 
                    onClick={() => handleButtonClick(props.btn5)}
                    className='bg-blue-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white transition'
                >
                    {props.btn5}
                </button>
            )}

            {props.btn6 && (
                <button 
                    onClick={() => handleButtonClick(props.btn6)}
                    className='bg-blue-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white transition'
                >
                    {props.btn6}
                </button>
            )}
            
        </div>
    )
}

export default LeftNav
