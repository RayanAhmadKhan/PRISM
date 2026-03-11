import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

function AdminDashboard() {
  const { user } = useAuth();
  const { users, auditLogs } = useSelector((state) => state.adminDashboard);

  const sampleUsers =
    users.length > 0
      ? users
      : [
          { name: 'Ad Alex', role: 'Admin', status: 'Active' },
          { name: 'John Doe', role: 'Admin', status: 'Active' },
          { name: 'Sarah Lee', role: 'Admin', status: 'Active' },
          { name: 'Dr. Ahmad', role: 'Instructor', status: 'Active' },
          { name: 'Abdullah', role: 'Student', status: 'Active' },
          { name: 'Omar Khan', role: 'Student', status: 'Active' },
          { name: 'Aisha Khan', role: 'Student', status: 'Active' },
        ];

  const sampleAuditLogs =
    auditLogs.length > 0
      ? auditLogs
      : [
          { date: '2025-02-26', name: 'Ad Alex', action: 'Add User: Abdullah' },
          { date: '2025-02-26', name: 'Dr. Ahmad', action: 'Attendance Record: AI2002' },
          { date: '2025-02-26', name: 'Ad Alex', action: 'Add User: Omar Khan' },
          { date: '2025-02-26', name: 'Ad Alex', action: 'Add User: Aisha Khan' },
        ];

  return (
    <div className="app-shell">
      <div className="top-bar">Admin UI</div>
      <div className="layout">
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand">
              <div className="sidebar-brand-line1">FAST NUCES</div>
              <div className="sidebar-brand-line2">PRISM</div>
            </div>
            <nav className="sidebar-nav">
              <div className="sidebar-link active">DashBoard</div>
              <div className="sidebar-link">User Management</div>
              <div className="sidebar-link">Audit Logs</div>
              <div className="sidebar-link">Setting</div>
            </nav>
          </div>
          <div className="sidebar-footer">Logout</div>
        </aside>

        <main className="content">
          <header className="content-header">
            <div>
              <div className="content-title">DashBoard</div>
              <div className="content-subtitle">User Management & Audit Logs</div>
            </div>
            <div className="content-username">{user?.email ?? 'Ad Alex'}</div>
          </header>

          <section className="cards-row">
            <div className="panel">
              <div className="filter-row">
                <div className="panel-header">User Management</div>
                <button type="button" className="filter-button">
                  Role Filter
                </button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Names</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th colSpan={2}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleUsers.map((entry) => (
                    <tr key={`${entry.name}-${entry.role}`}>
                      <td>{entry.name}</td>
                      <td>{entry.role}</td>
                      <td className="status-positive">{entry.status}</td>
                      <td>
                        <button type="button" className="btn-chip btn-green">
                          Edit
                        </button>
                      </td>
                      <td>
                        <button type="button" className="btn-chip btn-red">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="button" className="export-button">
                Add User
              </button>
            </div>

            <div className="panel">
              <div className="panel-header">Audit Logs</div>
              <div className="date-range">
                <div className="date-chip">From: 2025-02-26</div>
                <div className="date-chip">To: 2025-02-26</div>
              </div>

              <table className="table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleAuditLogs.map((log, index) => (
                    <tr key={`${log.date}-${log.name}-${index.toString()}`}>
                      <td>{log.date}</td>
                      <td>{log.name}</td>
                      <td>{log.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="button" className="export-button">
                Export Log
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

