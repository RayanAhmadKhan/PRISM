import React, { useState, useEffect } from 'react'

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    courseCode: '',
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
      
      const response = await fetch('http://localhost:5000/getCourse', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data = await response.json()
      console.log('Fetched courses:', data)
      const formattedCourses = (data.courses || []).map(course => ({
        id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        creditHours: course.creditHours || 'N/A',
        status: 'Active',
        action: 'Edit'
      }))

      setCourses(formattedCourses)
      setError(null)
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:5000/createCourse', {
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
      setShowModal(false)
      setFormData({ courseCode: '', courseName: '', creditHours: '' })
      fetchCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error adding course:', err)
      setError(err.message || 'Failed to add course')
    }
  }

  const handleDeleteCourse = async (courseCode) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`http://localhost:5000/deleteCourse?courseCode=${courseCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete course')
      }

      setSuccess('Course deleted successfully!')
      fetchCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error deleting course:', err)
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
      {/* Success/Error Messages */}
      {success && <div className='bg-green-900 border-2 border-green-600 p-3 rounded text-green-200'>{success}</div>}
      {error && <div className='bg-red-900 border-2 border-red-600 p-3 rounded text-red-200'>{error}</div>}

      <div className="header w-full flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <h1 className='font-bold text-lg md:text-xl'>Course Management</h1>
        <div className="side-btns flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="text"
            placeholder='Search by course code or name...'
            className='bg-zinc-900 p-2 w-full sm:w-47 font-bold rounded-sm border-2 border-gray-600 text-white'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setShowModal(true)}
            className='bg-blue-700 w-full sm:w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900'
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto border-2 border-gray-600 rounded-md">
        <table className='w-full text-sm md:text-base'>
          <thead className='bg-zinc-900 border-b-2 border-gray-600'>
            <tr>
              <th className='p-3 text-left font-bold'>Course Code</th>
              <th className='p-3 text-left font-bold'>Course Name</th>
              <th className='p-3 text-left font-bold'>Credit Hours</th>
              <th className='p-3 text-left font-bold'>Status</th>
              <th className='p-3 text-left font-bold'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, idx) => (
                <tr key={idx} className='border-b border-gray-600 hover:bg-zinc-700'>
                  <td className='p-3 font-semibold'>{course.courseCode}</td>
                  <td className='p-3'>{course.courseName}</td>
                  <td className='p-3'>{course.creditHours}</td>
                  <td className='p-3'><span className='bg-green-900 px-2 py-1 rounded'>{course.status}</span></td>
                  <td className='p-3'>
                    <button 
                      onClick={() => handleDeleteCourse(course.courseCode)}
                      className='bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className='p-3 text-center text-gray-400'>No courses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Course Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3'>
          <div className='bg-zinc-900 border-2 border-gray-600 rounded-lg p-5 md:p-8 w-full max-w-md'>
            <h2 className='text-xl md:text-2xl font-bold mb-5'>Add New Course</h2>
            
            <form onSubmit={handleAddCourse} className='flex flex-col gap-4'>
              <div>
                <label className='block text-sm font-semibold mb-2'>Course Code</label>
                <input 
                  type='text'
                  required
                  value={formData.courseCode}
                  onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white'
                  placeholder='e.g., CS101'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2'>Course Name</label>
                <input 
                  type='text'
                  required
                  value={formData.courseName}
                  onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white'
                  placeholder='Enter course name'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2'>Credit Hours</label>
                <input 
                  type='number'
                  required
                  value={formData.creditHours}
                  onChange={(e) => setFormData({...formData, creditHours: e.target.value})}
                  className='w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white'
                  placeholder='e.g., 3'
                />
              </div>

              <div className='flex gap-3 mt-5'>
                <button 
                  type='submit'
                  className='flex-1 bg-blue-700 hover:bg-blue-800 p-2 rounded font-bold'
                >
                  Add Course
                </button>
                <button 
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='flex-1 bg-gray-700 hover:bg-gray-800 p-2 rounded font-bold'
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
