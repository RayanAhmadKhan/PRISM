import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import LeftNav from "../../../components/LeftNav";
import AdUserManagment from "./AdUserManagment";
import AdCourseManagment from "./AdCourseManagment";
import AdSectionManagment from "./AdSectionManagment";
import AdAttendanceQA from "./AdAttendanceQA";

import { jwtDecode } from "jwt-decode";

import BASE_URL from '../../../config.js';

const AdminDash = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalSections: 0
  });
  const [topUsers, setTopUsers] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [topSections, setTopSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const usersRes = await fetch(`${BASE_URL}/getAllUsers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      const allUsers = [];
      if (usersData.students)
        allUsers.push(...usersData.students.map((u) => ({ ...u, type: "Student" })));
      if (usersData.instructors)
        allUsers.push(...usersData.instructors.map((u) => ({ ...u, type: "Instructor" })));
      if (usersData.admins)
        allUsers.push(...usersData.admins.map((u) => ({ ...u, type: "Admin" })));
      const totalUsers = allUsers.length;
      setTopUsers(allUsers.slice(0, 5));

      const coursesRes = await fetch(`${BASE_URL}/getCourse`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      const allCourses = coursesData.courses || [];
      setTopCourses(allCourses.slice(0, 5));

      const sectionsRes = await fetch(`${BASE_URL}/getSection`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sectionsData = await sectionsRes.json();
      const allSections = sectionsData.sections || [];
      setTopSections(allSections.slice(0, 5));

      setStats({
        totalUsers,
        totalCourses: allCourses.length,
        totalSections: allSections.length
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    blue: { bg: "bg-blue-900", border: "border-blue-600", text: "text-blue-400" },
    green: { bg: "bg-green-900", border: "border-green-600", text: "text-green-400" },
    purple: { bg: "bg-purple-900", border: "border-purple-600", text: "text-purple-400" }
  };

  const StatCard = ({ title, value, icon, color }) => {
    const colors = colorClasses[color] || colorClasses.blue;
    return (
      <div
        className={`flex flex-col gap-3 p-4 md:p-6 ${colors.bg} border-2 ${colors.border} rounded-lg flex-1 min-w-50`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm md:text-base font-semibold text-gray-300">{title}</h3>
          <span className="text-2xl md:text-3xl">{icon}</span>
        </div>
        <p className={`text-2xl md:text-4xl font-bold ${colors.text}`}>{value}</p>
      </div>
    );
  };

  return (
    <div className="min-h-dvh w-full">
      <Navbar
        title={"Admin Dashboard"}
        user={jwtDecode(localStorage.getItem("token")).name || "Admin"}
      />
      <div className="body bg-zinc-900 flex h-screen overflow-hidden">
        <LeftNav
          btn1={"Admin Dashboard"}
          btn2={"User Management"}
          btn3={"Course Management"}
          btn4={"Section Management"}
          btn5={"Attendance/QA"}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        <div className="container flex flex-col bg-linear-to-br from-zinc-900 via-zinc-800 to-blue-900 w-full overflow-hidden">
          <div className="content-area flex-1 overflow-y-auto p-3 md:p-6 flex flex-col items-center">

            {activeTab === "overview" && (
              <div className="flex flex-col gap-5 w-full max-w-7xl">
                <h1 className="font-bold text-xl md:text-3xl text-white text-center">
                  Dashboard Overview
                </h1>
                {loading ? (
                  <div className="text-center text-gray-400">Loading statistics...</div>
                ) : (
                  <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Total Users"     value={stats.totalUsers}           icon="👥" color="blue"   />
                    <StatCard title="Total Courses"   value={stats.totalCourses}         icon="📚" color="green"  />
                    <StatCard title="Total Sections"  value={stats.totalSections}        icon="📋" color="purple" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-zinc-900 p-4 rounded-lg border border-blue-600">
                    <h2 className="text-white font-bold mb-3">Top Users</h2>
                    {topUsers.map((user, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveTab("users")}
                        className="p-2 mb-2 bg-zinc-800 rounded cursor-pointer hover:bg-blue-700 transition"
                      >
                        <p className="text-white text-sm">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-900 p-4 rounded-lg border border-green-600">
                    <h2 className="text-white font-bold mb-3">Top Courses</h2>
                    {topCourses.map((course, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveTab("courses")}
                        className="p-2 mb-2 bg-zinc-800 rounded cursor-pointer hover:bg-green-700 transition"
                      >
                        <p className="text-white text-sm">{course.courseName}</p>
                        <p className="text-gray-400 text-xs">{course.courseCode}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-900 p-4 rounded-lg border border-purple-600">
                    <h2 className="text-white font-bold mb-3">Top Sections</h2>
                    {topSections.map((section, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveTab("sections")}
                        className="p-2 mb-2 bg-zinc-800 rounded cursor-pointer hover:bg-purple-700 transition"
                      >
                        <p className="text-white text-sm">{section.sectionName}</p>
                        <p className="text-gray-400 text-xs">{section.semester}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="w-full max-w-7xl flex justify-center">
              {activeTab === "users"          && <AdUserManagment />}
              {activeTab === "courses"        && <AdCourseManagment />}
              {activeTab === "sections"       && <AdSectionManagment />}
              {activeTab === "attendance"     && <AdAttendanceQA />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
