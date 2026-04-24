import React, { useState, useEffect } from 'react'
import Navbar from '../../../components/Navbar'
import LeftNav from '../../../components/LeftNav'
import AdUserManagment from './AdUserManagment'
import AdCourseManagment from './AdCourseManagment'
import AdSectionManagment from './AdSectionManagment'
import AdAttendanceQA from './AdAttendanceQA'
import AdFlaggedCases from './AdFlaggedCases'
import AdAudit from './AdAudit'
import AdSettings from './AdSettings'
import { jwtDecode } from 'jwt-decode'

const AdminDash = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalSections: 0,
    attendanceRate: 0
  })
  const [topUsers, setTopUsers] = useState([])
  const [topCourses, setTopCourses] = useState([])
  const [topSections, setTopSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      
      // Fetch users
      const usersRes = await fetch('http://localhost:5000/getAllUsers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const usersData = await usersRes.json()
      const allUsers = []
      
      if (usersData.students) {
        allUsers.push(...usersData.students.map(u => ({ ...u, type: 'Student' })))
      }
      if (usersData.instructors) {
        allUsers.push(...usersData.instructors.map(u => ({ ...u, type: 'Instructor' })))
      }
      if (usersData.admins) {
        allUsers.push(...usersData.admins.map(u => ({ ...u, type: 'Admin' })))
      }
      
      const totalUsers = allUsers.length
      setTopUsers(allUsers.slice(0, 5))

      // Fetch courses
      const coursesRes = await fetch('http://localhost:5000/getCourse', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const coursesData = await coursesRes.json()
      const allCourses = coursesData.courses || []
      const totalCourses = allCourses.length
      setTopCourses(allCourses.slice(0, 5))

      // Fetch sections
      const sectionsRes = await fetch('http://localhost:5000/getSection', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const sectionsData = await sectionsRes.json()
      const allSections = sectionsData.sections || []
      const totalSections = allSections.length
      setTopSections(allSections.slice(0, 5))

      // Fetch attendance for rate calculation
      const attendanceRes = await fetch('http://localhost:5000/getAttendanceRecord', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const attendanceData = await attendanceRes.json()
      const records = attendanceData.attendance || []
      let totalPresent = 0
      let totalStudents = 0
      records.forEach(record => {
        totalStudents += record.students?.length || 0
        totalPresent += record.students?.filter(s => s.status === 'Present').length || 0
      })
      const attendanceRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0

      setStats({
        totalUsers,
        totalCourses,
        totalSections,
        attendanceRate
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`flex flex-col gap-3 p-4 md:p-6 bg-${color}-900 border-2 border-${color}-600 rounded-lg flex-1 min-w-[200px]`}>
      <div className="flex justify-between items-center">
        <h3 className='text-sm md:text-base font-semibold text-gray-300'>{title}</h3>
        <span className='text-2xl md:text-3xl'>{icon}</span>
      </div>
      <p className={`text-2xl md:text-4xl font-bold text-${color}-400`}>{value}</p>
    </div>
  )

  return (
    <div className='min-h-dvh w-full'>
      <Navbar title={"Admin Dashboard"} user={jwtDecode(localStorage.getItem('token')).name || "Admin"} />
      <div className="body bg-zinc-900 flex h-screen overflow-hidden">
        <LeftNav 
          btn1={"Admin Dashboard"} 
          btn2={"User Management"} 
          btn3={"Course Management"}
          btn4={"Section Management"} 
          btn5={"Attendance/QA"}
          onTabChange={(tab) => {
            setActiveTab(tab)
          }}
        />
        
        <div className="container flex flex-col bg-zinc-800 w-full overflow-hidden">
          {/* Content Area */}
          <div className="content-area flex-1 overflow-y-auto p-3 md:p-5">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-5">
                <h1 className='font-bold text-xl md:text-3xl text-white'>Dashboard Overview</h1>
                
                {loading ? (
                  <div className='text-center text-gray-400'>Loading statistics...</div>
                ) : (
                  <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Total Users" 
                      value={stats.totalUsers} 
                      icon="👥" 
                      color="blue"
                    />
                    <StatCard 
                      title="Total Courses" 
                      value={stats.totalCourses} 
                      icon="📚" 
                      color="green"
                    />
                    <StatCard 
                      title="Total Sections" 
                      value={stats.totalSections} 
                      icon="📋" 
                      color="purple"
                    />
                    <StatCard 
                      title="Attendance Rate" 
                      value={`${stats.attendanceRate}%`} 
                      icon="✅" 
                      color="yellow"
                    />
                  </div>
                )}

                <div className="quick-actions mt-5">
                  <h2 className='font-bold text-lg md:text-xl text-white mb-4'>Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button 
                      onClick={() => setActiveTab('users')}
                      className='bg-blue-600 hover:bg-blue-700 p-3 rounded-md text-white font-semibold transition'
                    >
                      Manage Users
                    </button>
                    <button 
                      onClick={() => setActiveTab('courses')}
                      className='bg-green-600 hover:bg-green-700 p-3 rounded-md text-white font-semibold transition'
                    >
                      Manage Courses
                    </button>
                    <button 
                      onClick={() => setActiveTab('sections')}
                      className='bg-purple-600 hover:bg-purple-700 p-3 rounded-md text-white font-semibold transition'
                    >
                      Manage Sections
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && <AdUserManagment />}

            {/* Course Management Tab */}
            {activeTab === 'courses' && <AdCourseManagment />}

            {/* Section Management Tab */}
            {activeTab === 'sections' && <AdSectionManagment />}

            {/* Attendance/QA Tab */}
            {activeTab === 'attendance' && <AdAttendanceQA />}

            {/* Settings Tab */}
            {activeTab === 'settings' && <AdSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDash