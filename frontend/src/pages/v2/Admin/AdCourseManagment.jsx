import React, { useState, useEffect } from 'react'
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    creditHours: ''
  })
  const [editFormData, setEditFormData] = useState({
    courseName: '',
    creditHours: ''
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`${BASE_URL}/getCourse`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch courses')

      const data = await response.json()
      const formattedCourses = (data.courses || []).map(course => ({
        id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        creditHours: course.creditHours || 'N/A',
        status: 'Active'
      }))

      setCourses(formattedCourses)
      setError(null)
    } catch (err) {
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${BASE_URL}/createCourse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to add course')
      }

      setSuccess('Course added successfully!')
      setShowAddModal(false)
      setFormData({ courseCode: '', courseName: '', creditHours: '' })
      fetchCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add course')
    }
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setEditFormData({
      courseName: course.courseName,
      creditHours: course.creditHours === 'N/A' ? '' : course.creditHours
    })
    setShowEditModal(true)
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      const body = {
        courseCode: editingCourse.courseCode,
        ...(editFormData.courseName.trim() && { courseName: editFormData.courseName.trim() }),
        ...(editFormData.creditHours !== '' && { creditHours: editFormData.creditHours })
      }

      const response = await fetch(`${BASE_URL}/changeCourseInfo`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to update course')
      }

      setSuccess('Course updated successfully!')
      setShowEditModal(false)
      setEditingCourse(null)
      fetchCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update course')
    }
  }

  const handleDeleteCourse = async (courseCode) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${BASE_URL}/deleteCourse?courseCode=${courseCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to delete course')

      setSuccess('Course deleted successfully!')
      fetchCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to delete course')
    }
  }

  if (loading) {
    return (
      <div className="p-3 md:p-5">
        <p className='text-gray-400'>Loading courses...</p>
      </div>
    )
  }

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-3 md:p-5 flex flex-col gap-5">
      {success && <div className='bg-green-900 border-2 border-green-600 p-3 rounded text-green-200'>{success}</div>}
      {error && <div className='bg-red-900 border-2 border-red-600 p-3 rounded text-red-200'>{error}</div>}

      <div className="header w-full flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <h1 className='font-bold text-lg md:text-xl text-white'>Course Management</h1>
        <div className="side-btns flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="text"
            placeholder='Search by course code or name...'
            className='bg-zinc-900 p-2 w-full sm:w-47 font-bold rounded-sm border-2 border-gray-600 text-white'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowAddModal(true)}
            className='bg-blue-700 w-full sm:w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white'
          >
            + Add Course
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border-2 border-blue-600/50 shadow-2xl bg-zinc-900/30 backdrop-blur">
        <table className="w-full bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900">
          <thead>
            <tr className="border-b-2 border-blue-600/50 bg-linear-to-r from-blue-950 via-blue-900 to-blue-950">
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Course Code</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Course Name</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Credit Hours</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, idx) => (
                <tr key={idx} className="border-b border-gray-700/50 hover:bg-zinc-700/50 transition duration-200">
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">{course.courseCode}</td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">{course.courseName}</td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">{course.creditHours}</td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium"><span className='bg-green-900 px-2 py-1 rounded text-white'>{course.status}</span></td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium flex gap-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className='bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm font-bold text-white'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.courseCode)}
                      className='bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold text-white'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">No courses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3'>
          <div className='bg-zinc-900 border-2 border-gray-600 rounded-lg p-5 md:p-8 w-full max-w-md'>
            <h2 className='text-xl md:text-2xl font-bold mb-5 text-white'>Add New Course</h2>

            <form onSubmit={handleAddCourse} className='flex flex-col gap-4'>
              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-200'>Course Code</label>
                <input
                  type='text'
                  required
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white'
                  placeholder='e.g., CS101'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-200'>Course Name</label>
                <input
                  type='text'
                  required
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white'
                  placeholder='Enter course name'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-200'>Credit Hours</label>
                <input
                  type='number'
                  required
                  value={formData.creditHours}
                  onChange={(e) => setFormData({ ...formData, creditHours: e.target.value })}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white'
                  placeholder='e.g., 3'
                />
              </div>

              <div className='flex gap-3 mt-5'>
                <button
                  type='submit'
                  className='flex-1 bg-blue-700 hover:bg-blue-800 p-2 rounded font-bold text-white'
                >
                  Add Course
                </button>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 bg-gray-700 hover:bg-gray-800 p-2 rounded font-bold text-white'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingCourse && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3'>
          <div className='bg-zinc-900 border-2 border-yellow-600 rounded-lg p-5 md:p-8 w-full max-w-md'>
            <h2 className='text-xl md:text-2xl font-bold mb-1 text-white'>Edit Course</h2>
            <p className='text-gray-400 text-sm mb-5'>
              Editing: <span className='text-yellow-400 font-semibold'>{editingCourse.courseCode}</span> — only fill fields you want to update.
            </p>

            <form onSubmit={handleUpdateCourse} className='flex flex-col gap-4'>
              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-200'>Course Code</label>
                <input
                  type='text'
                  disabled
                  value={editingCourse.courseCode}
                  className='w-full bg-zinc-700 p-2 border-2 border-gray-600 rounded text-gray-400 cursor-not-allowed'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-200'>Course Name</label>
                <input
                  type='text'
                  value={editFormData.courseName}
                  onChange={(e) => setEditFormData({ ...editFormData, courseName: e.target.value })}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none'
                  placeholder='Leave blank to keep current'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-200'>Credit Hours</label>
                <input
                  type='number'
                  value={editFormData.creditHours}
                  onChange={(e) => setEditFormData({ ...editFormData, creditHours: e.target.value })}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none'
                  placeholder='Leave blank to keep current'
                />
              </div>

              <div className='flex gap-3 mt-5'>
                <button
                  type='submit'
                  className='flex-1 bg-yellow-600 hover:bg-yellow-700 p-2 rounded font-bold text-white'
                >
                  Update Course
                </button>
                <button
                  type='button'
                  onClick={() => { setShowEditModal(false); setEditingCourse(null) }}
                  className='flex-1 bg-gray-700 hover:bg-gray-800 p-2 rounded font-bold text-white'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
