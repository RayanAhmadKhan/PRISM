import React, { useState, useEffect } from 'react'
import Table from '../../../components/Table'

const AttendanceQA = () => {
  const [attendance, setAttendance] = useState([])
  const [sections, setSections] = useState([])
  const [courses, setCourses] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterSection, setFilterSection] = useState("")

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      await Promise.all([
        fetchAttendance(),
        fetchSections(),
        fetchCourses()
      ])

    } catch (err) {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- FETCH ATTENDANCE ----------------
  const fetchAttendance = async () => {
    const res = await fetch('http://localhost:5000/getAttendanceRecord', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) throw new Error("Attendance fetch failed")

    const data = await res.json()

    const records = data || []

    const formatted = records.map(record => ({
      date: new Date(record.date).toLocaleDateString(),

      sectionName: record.section?.sectionName || "N/A",
      courseCode: record.section?.courseCode?.courseCode || "N/A",

      totalStudents: record.students?.length || 0,
      presentCount: record.students?.filter(s => s.status === "Present").length || 0,
      absentCount: record.students?.filter(s => s.status === "Absent").length || 0,

      status: record.status || "N/A",
      action: "Review"
    }))

    setAttendance(formatted)
  }

  // ---------------- FETCH SECTIONS ----------------
  const fetchSections = async () => {
    const res = await fetch('http://localhost:5000/getSection', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    console.log("Fetched sections on attendance page:", data.sections)
    setSections(data.sections || [])
  }

  // ---------------- FETCH COURSES ----------------
  const fetchCourses = async () => {
    const res = await fetch('http://localhost:5000/getCourse', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    console.log("Fetched courses on attendance page:", data)
    setCourses(data.courses || [])
  }

  // ---------------- FILTER ----------------
  const filteredAttendance = attendance.filter(record =>
    record.sectionName.toLowerCase().includes(filterSection.toLowerCase()) ||
    record.courseCode.toLowerCase().includes(filterSection.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-3 md:p-5">
        <p className='text-gray-400'>Loading attendance records...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 md:p-5">
        <p className='text-red-400'>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-5 flex flex-col gap-5">

      <div className="header w-full flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <h1 className='font-bold text-lg md:text-xl'>Attendance/QA Records</h1>

        <div className="side-btns flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder='Filter by section or course...'
            className='bg-zinc-900 p-2 w-full sm:w-47 font-bold rounded-sm border-2 border-gray-600 text-white'
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={[
          "Date",
          "Section",
          "Course Code",
          "Total Students",
          "Present",
          "Absent",
          "Status",
          "Action"
        ]}
        rows={filteredAttendance}
      />

    </div>
  )
}

export default AttendanceQA