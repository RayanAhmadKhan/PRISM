import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

function TeacherDashboard() {
  const { user } = useAuth();
  const { flaggedCases, sessions } = useSelector((state) => state.teacherDashboard);

  const sampleFlaggedCases =
    flaggedCases.length > 0
      ? flaggedCases
      : [
          { name: 'Aisha Khan', face: '75%', id: '23L-0568 (AI2002)' },
          { name: 'Abdullah', face: '65%', id: '23L-0768 (AI2002)' },
          { name: 'Omar Khan', face: '50%', id: '23L-0577 (CS4001)' },
          { name: 'Liam Patel', face: '75%', id: '23L-0500 (AI2002)' },
        ];

  const sampleSessions =
    sessions.length > 0
      ? sessions
      : [
          { date: '2025-02-26', course: 'AI2002', section: 'BCS6D', time: '9:00' },
          { date: '2025-02-26', course: 'AI2002', section: 'BCS6F', time: '10:00' },
          { date: '2025-02-26', course: 'CS4001', section: 'BCS6B', time: '13:00' },
          { date: '2025-02-26', course: 'CS4001', section: 'BCS6A', time: '14:00' },
          { date: '2025-02-26', course: 'CS4001', section: 'BCS6A', time: '15:00' },
        ];

  return (
    <div className="app-shell">
      <div className="top-bar">Teachers UI</div>
      <div className="layout">
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand">
              <div className="sidebar-brand-line1">FAST NUCES</div>
              <div className="sidebar-brand-line2">PRISM</div>
            </div>
            <nav className="sidebar-nav">
              <div className="sidebar-link active">DashBoard</div>
              <div className="sidebar-link">Attendance Record</div>
              <div className="sidebar-link">Flagged Cases</div>
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
              <div className="content-subtitle">Flagged Cases & Session Management</div>
            </div>
            <div className="content-username">{user?.email ?? 'Dr. Ahamd Raza'}</div>
          </header>

          <section className="cards-row">
            <div className="panel">
              <div className="panel-header">Flagged Cases</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Face</th>
                    <th>ID</th>
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sampleFlaggedCases.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.name}</td>
                      <td>{entry.face}</td>
                      <td>{entry.id}</td>
                      <td>
                        <button type="button" className="btn-chip btn-outline">
                          Ask for Explanation
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="btn-chip btn-green">
                            Approve
                          </button>
                          <button type="button" className="btn-chip btn-red">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button type="button">{'<'}</button>
                <button type="button">1</button>
                <button type="button">{'>'}</button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Session Management</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Dates</th>
                    <th>Course</th>
                    <th>Section</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleSessions.map((session) => (
                    <tr key={`${session.date}-${session.course}-${session.section}-${session.time}`}>
                      <td>{session.date}</td>
                      <td>{session.course}</td>
                      <td>{session.section}</td>
                      <td>{session.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="button" className="export-button">
                Add New Session
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default TeacherDashboard;

