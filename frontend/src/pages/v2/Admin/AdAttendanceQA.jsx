import React, { useState, useEffect } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || "https://prism-backend-iyo3.onrender.com"

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

  const fetchAttendance = async () => {
    const res = await fetch(`${BASE_URL}/getAttendanceRecord`, {
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

  const fetchSections = async () => {
    const res = await fetch(`${BASE_URL}/getSection`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    setSections(data.sections || [])
  }

  const fetchCourses = async () => {
    const res = await fetch(`${BASE_URL}/getCourse`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    setCourses(data.courses || [])
  }

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
        <h1 className='font-bold text-lg md:text-xl text-white'>Attendance/QA Records</h1>

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

      <div className="w-full overflow-x-auto rounded-lg border-2 border-blue-600/50 shadow-2xl bg-zinc-900/30 backdrop-blur">
        <table className="w-full bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900">
          <thead>
            <tr className="border-b-2 border-blue-600/50 bg-linear-to-r from-blue-950 via-blue-900 to-blue-950">
              {["Date", "Section", "Course Code", "Total Students", "Present", "Absent", "Status", "Action"].map((col, index) => (
                <th key={index} className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAttendance && filteredAttendance.map((row, i) => (
              <tr key={i} className="border-b border-gray-700/50 hover:bg-zinc-700/50 transition duration-200">
                {Object.values(row).map((value, j) => (
                  <td key={j} className="px-6 py-4 text-gray-200 text-sm font-medium">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default AttendanceQA
