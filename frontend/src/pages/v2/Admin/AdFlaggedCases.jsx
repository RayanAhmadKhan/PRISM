import React, { useState, useEffect } from 'react'

const FlaggedCases = () => {
  const [flaggedCases, setFlaggedCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchFlaggedCases = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const instructorId = localStorage.getItem('userId') // Assuming instructor ID is stored
        
        const response = await fetch(`http://localhost:5000/getFlaggedCases?markedBy=${instructorId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch flagged cases')
        }

        const data = await response.json()
        const formattedCases = (data.flaggedCases || []).map(flaggedCase => ({
          id: flaggedCase._id,
          studentName: flaggedCase.studentId?.name || 'Unknown',
          studentId: flaggedCase.studentId?.rollNumber || 'N/A',
          flagReason: flaggedCase.flagReason || 'No reason provided',
          date: new Date(flaggedCase.createdAt).toLocaleDateString(),
          confidenceScore: flaggedCase.confidenceScore || 'N/A',
          status: flaggedCase.status || 'Pending',
          action: 'Review'
        }))

        setFlaggedCases(formattedCases)
        setError(null)
      } catch (err) {
        console.error('Error fetching flagged cases:', err)
        setError('Failed to load flagged cases')
      } finally {
        setLoading(false)
      }
    }

    fetchFlaggedCases()
  }, [])

  const filteredCases = filterStatus === 'all' 
    ? flaggedCases 
    : flaggedCases.filter(c => c.status.toLowerCase() === filterStatus.toLowerCase())

  const handleApprove = async (caseId) => {
    try {
      const token = localStorage.getItem('token')
      const studentId = flaggedCases.find(c => c.id === caseId)?.studentId

      const response = await fetch('http://localhost:5000/flagApproval', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attendanceId: caseId,
          studentId: studentId,
          action: 'approve'
        })
      })

      if (response.ok) {
        setFlaggedCases(prev => 
          prev.map(c => c.id === caseId ? { ...c, status: 'Approved' } : c)
        )
      }
    } catch (err) {
      console.error('Error approving case:', err)
    }
  }

  const handleReject = async (caseId) => {
    try {
      const token = localStorage.getItem('token')
      const studentId = flaggedCases.find(c => c.id === caseId)?.studentId

      const response = await fetch('http://localhost:5000/flagApproval', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attendanceId: caseId,
          studentId: studentId,
          action: 'reject'
        })
      })

      if (response.ok) {
        setFlaggedCases(prev => 
          prev.map(c => c.id === caseId ? { ...c, status: 'Rejected' } : c)
        )
      }
    } catch (err) {
      console.error('Error rejecting case:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-3 md:p-5">
        <p className='text-gray-400'>Loading flagged cases...</p>
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
        <h1 className='font-bold text-lg md:text-xl'>Flagged Cases</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='bg-zinc-900 p-2 font-bold rounded-sm border-2 border-gray-600 w-full sm:w-auto'
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="cases-list flex flex-col gap-3">
        {filteredCases.length === 0 ? (
          <p className='text-gray-400 text-center py-8'>No flagged cases found</p>
        ) : (
          filteredCases.map((flaggedCase) => (
            <div key={flaggedCase.id} className="case-card bg-zinc-900 border-2 border-gray-600 rounded-md p-4 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row justify-between gap-2">
                <div>
                  <p className='text-sm text-gray-400'>Student</p>
                  <p className='font-bold'>{flaggedCase.studentName} ({flaggedCase.studentId})</p>
                </div>
                <div>
                  <p className='text-sm text-gray-400'>Date</p>
                  <p className='font-bold'>{flaggedCase.date}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-400'>Confidence Score</p>
                  <p className='font-bold'>{flaggedCase.confidenceScore}%</p>
                </div>
                <div>
                  <p className='text-sm text-gray-400'>Status</p>
                  <p className={`font-bold ${
                    flaggedCase.status === 'Approved' ? 'text-green-400' : 
                    flaggedCase.status === 'Rejected' ? 'text-red-400' : 
                    'text-yellow-400'
                  }`}>
                    {flaggedCase.status}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-800 p-3 rounded">
                <p className='text-sm text-gray-400 mb-1'>Flag Reason:</p>
                <p className='text-sm'>{flaggedCase.flagReason}</p>
              </div>

              {flaggedCase.status === 'Pending' && (
                <div className="action-buttons flex gap-2">
                  <button
                    onClick={() => handleApprove(flaggedCase.id)}
                    className='bg-green-700 p-2 font-bold rounded-sm cursor-pointer hover:bg-green-800 flex-1'
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(flaggedCase.id)}
                    className='bg-red-700 p-2 font-bold rounded-sm cursor-pointer hover:bg-red-800 flex-1'
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default FlaggedCases
