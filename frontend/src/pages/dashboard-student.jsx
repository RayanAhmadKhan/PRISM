import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

function StudentDashboard() {
  const { user } = useAuth();
  const { confidenceLevel } = useSelector((state) => state.studentDashboard);

  const history = [
    { date: '2025-02-26', course: 'AI2002', status: 'Present (Face)', verified: '96%' },
    { date: '2025-02-26', course: 'CS3009', status: 'Present (Face)', verified: '97%' },
    { date: '2025-02-26', course: 'CS3014', status: 'Absent', verified: '-' },
    { date: '2025-02-26', course: 'CS4001', status: 'Absent', verified: '-' },
    { date: '2025-02-26', course: 'CS4032', status: 'Present (Face)', verified: '92%' },
    { date: '2025-02-26', course: 'EE3009', status: 'Present (Fingerprint)', verified: '-' },
  ];

  return (
    <div className="app-shell">
      <div className="top-bar">Student UI</div>
      <div className="layout">
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand">
              <div className="sidebar-brand-line1">FAST NUCES</div>
              <div className="sidebar-brand-line2">PRISM</div>
            </div>
            <nav className="sidebar-nav">
              <div className="sidebar-link active">DashBoard</div>
              <div className="sidebar-link">Courses</div>
              <div className="sidebar-link">Attendance</div>
              <div className="sidebar-link">Profile</div>
              <div className="sidebar-link">Setting</div>
            </nav>
          </div>
          <div className="sidebar-footer">Logout</div>
        </aside>

        <main className="content">
          <header className="content-header">
            <div>
              <div className="content-title">DashBoard</div>
              <div className="content-subtitle">Mark Attendance</div>
            </div>
            <div className="content-username">{user?.email ?? 'Ghulam Dastgir'}</div>
          </header>

          <section className="cards-row">
            <div className="panel">
              <div className="panel-header">Mark Attendance</div>
              <div className="verification-row">
                <div className="verification-card">
                  <div className="verification-label">Face</div>
                </div>
                <div className="verification-card">
                  <div className="verification-label">Fingerprint</div>
                </div>
              </div>
              <div className="panel-subheader">Confidence Level</div>
              <div className="confidence-pill">{confidenceLevel}%</div>
              <button type="button" className="primary-cta">
                Start Verification
              </button>
            </div>

            <div className="panel">
              <div className="filter-row">
                <div className="panel-header">Attendance History</div>
                <button type="button" className="filter-button">
                  Apply Filter
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Dates</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={`${item.date}-${item.course}`}>
                      <td>{item.date}</td>
                      <td>{item.course}</td>
                      <td className={item.status.startsWith('Present') ? 'status-positive' : 'status-negative'}>
                        {item.status}
                      </td>
                      <td className="status-positive">{item.verified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;

