import React from 'react'

const LeftNav = (props) => {

    const getNavPath = (btnLabel) => {
        const paths = {
            "Student Dashboard":  "/pages/v2/StudentDash",
            "Teacher Dashboard":  "/pages/v2/Instructor/TeacherDash",
            "Admin Dashboard":    "/pages/v2/Admin/AdminDash",

            // student dash buttons
            "Courses":            "/pages/v2/Course",
            "Attendance History": "/pages/v2/StAttendance",
            "Profile":            "/pages/v2/StProfile",

            // teacher dash buttons (page-level nav — no onTabChange needed)
            "Attendance Record":  "/pages/v2/Instructor/TchAttendance",
            "Profile Settings":   "/pages/v2/Instructor/TchProfile",
            "Flagged Cases":      "/pages/v2/Instructor/TchCase",

            // admin dash buttons (internal tab navigation)
            "User Management":    "admin-users",
            "Course Management":  "admin-courses",
            "Section Management": "admin-sections",
            "Attendance/QA":      "admin-attendance",
            "Change Section":     "admin-changeSection",
            "Enroll Student":     "admin-enrollStudent",
            "Remove Student":     "admin-removeStudent",
        };

        return paths[btnLabel] || "/";
    }

    const handleButtonClick = (btnLabel) => {
        // Flagged Cases: admin uses tab, teacher uses page nav
        if (btnLabel === "Flagged Cases") {
            if (props.onTabChange) {
                props.onTabChange('flagged');
            } else {
                window.location.href = "/pages/v2/Instructor/TchCase";
            }
            return;
        }

        // Admin internal tabs
        const path = getNavPath(btnLabel);
        if (path.startsWith('admin-') && props.onTabChange) {
            const adminTabMap = {
                'admin-users':          'users',
                'admin-courses':        'courses',
                'admin-sections':       'sections',
                'admin-attendance':     'attendance',
                'admin-changeSection':  'changeSection',
                'admin-enrollStudent':  'enrollStudent',
                'admin-removeStudent':  'removeStudent',
            };
            props.onTabChange(adminTabMap[path]);
            return;
        }

        // Admin Dashboard overview
        if (btnLabel === "Admin Dashboard" && props.onTabChange) {
            props.onTabChange('overview');
            return;
        }

        // Default: navigate to page
        if (!path.startsWith('admin-')) {
            window.location.href = path;
        }
    }

    const buttons = [
        props.btn1,
        props.btn2,
        props.btn3,
        props.btn4,
        props.btn5,
        props.btn6,
        props.btn7,
        props.btn8,
    ].filter(Boolean);

    return (
        <div className="left-nav w-[15%] flex items-center justify-between py-6 gap-6 flex-col bg-zinc-900 h-screen border-r-2 border-gray-600 overflow-y-auto">
            <div className="flex flex-col items-center gap-6 w-full">
                {buttons.map((label) => (
                    <button
                        key={label}
                        onClick={() => handleButtonClick(label)}
                        className='bg-blue-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white transition'
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Logout — only rendered if onLogout is passed (AdminDash) */}
            {props.onLogout && (
                <button
                    onClick={props.onLogout}
                    className='bg-red-700 flex justify-center p-2 w-40 font-bold rounded-sm cursor-pointer hover:bg-red-900 text-white transition mb-2'
                >
                    Logout
                </button>
            )}
        </div>
    )
}

export default LeftNav