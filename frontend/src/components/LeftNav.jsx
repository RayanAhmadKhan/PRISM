import React from 'react'

const LeftNav = (props) => {

    const getNavPath = (btnLabel) => {
        const paths = {
            "Student Dashboard":  "/pages/v2/Student/StudentDash",
            "Teacher Dashboard":  "/pages/v2/Instructor/TeacherDash",
            "Admin Dashboard":    "/pages/v2/Admin/AdminDash",

            // student dash buttons
            "Courses":            "/pages/v2/Student/StCourses",
            "Attendance History": "/pages/v2/Student/StAttendance",
            "Profile":            "/pages/v2/Student/StProfile",

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
        // ── Teacher tabs (only when onTabChange is provided — i.e. inside TeacherDashboard) ──
        if (props.onTabChange) {
            const teacherTabMap = {
                "Teacher Dashboard":  "dashboard",
                "Attendance Record":  "attendance",
                "Flagged Cases":      "flagged",
                "Profile Settings":   "profile",
            };
            if (teacherTabMap[btnLabel] !== undefined) {
                props.onTabChange(teacherTabMap[btnLabel]);
                return;
            }

            // Admin internal tabs
            const path = getNavPath(btnLabel);
            if (path.startsWith('admin-')) {
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

            if (btnLabel === "Admin Dashboard") {
                props.onTabChange('overview');
                return;
            }
        }

        // ── Default: navigate to page ──
        const path = getNavPath(btnLabel);
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
        <div className="w-56 h-screen bg-linear-to-b from-zinc-950 via-zinc-900 to-blue-950 border-r-2 border-blue-600/50 flex flex-col items-center justify-between py-6 gap-4 overflow-y-auto shadow-2xl">
            <div className="flex flex-col items-center gap-3 w-full px-3">
                {buttons.map((label) => (
                    <button
                        key={label}
                        onClick={() => handleButtonClick(label)}
                        className="w-full px-4 py-2.5 font-medium text-sm text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-200 shadow-lg hover:shadow-blue-500/50 text-center"
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Logout — only rendered if onLogout is passed (AdminDash) */}
            {props.onLogout && (
                <button
                    onClick={props.onLogout}
                    className="w-full px-4 py-2.5 font-medium text-sm text-white bg-linear-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition duration-200 shadow-lg hover:shadow-red-500/50 mb-4 mx-3"
                >
                    Logout
                </button>
            )}
        </div>
    )
}

export default LeftNav
