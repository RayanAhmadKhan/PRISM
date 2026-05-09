import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../../components/Navbar";
import StCourse from "./StCourse";
import StProfile from "./StProfile";
const BASE_URL = import.meta.env.VITE_API_URL || "https://prism-backend-iyo3.onrender.com"

// ── Semester helpers ──────────────────────────────────────────────────────────
// Use T12:00:00 to avoid UTC-midnight timezone shift (e.g. UTC+5 shifts date back 1 day)
const getSemesterRange = (type, year) => {
  if (type === "spring") return {
    label: `Spring ${year}`,
    start: new Date(`${year}-01-01T12:00:00`),
    end:   new Date(`${year}-06-30T12:00:00`)
  };
  if (type === "summer") return {
    label: `Summer ${year}`,
    start: new Date(`${year}-06-01T12:00:00`),
    end:   new Date(`${year}-08-31T12:00:00`)
  };
  return {
    label: `Fall ${year}`,
    start: new Date(`${year}-08-01T12:00:00`),
    end:   new Date(`${year + 1}-01-31T12:00:00`)
  };
};

const getCurrentSemesterType = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 1 && m <= 5) return "spring";
  if (m >= 6 && m <= 7) return "summer";
  return "fall";
};

// Safe date parser — handles "2026-04-25" plain strings without UTC shift
const parseDate = (str) => {
  if (!str) return new Date(NaN);
  // Plain date string "YYYY-MM-DD" — add noon time to avoid timezone shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + "T12:00:00");
  return new Date(str);
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className={`flex flex-col gap-2 p-5 rounded-xl border-2 bg-zinc-900
    ${accent === "green"  ? "border-green-600"  :
      accent === "blue"   ? "border-blue-600"   :
      accent === "purple" ? "border-purple-600" : "border-gray-600"}`}>
    <div className="flex justify-between items-center">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{label}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold
      ${accent === "green"  ? "text-green-400"  :
        accent === "blue"   ? "text-blue-400"   :
        accent === "purple" ? "text-purple-400" : "text-white"}`}>
      {value}
    </p>
    {sub && <p className="text-xs text-gray-500">{sub}</p>}
  </div>
);

// ── Attendance bar ────────────────────────────────────────────────────────────
const AttBar = ({ pct }) => {
  const good = pct >= 80;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Attendance</span>
        <span className={`font-bold ${good ? "text-green-400" : "text-red-400"}`}>{pct}%</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${good ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StudentDash = () => {
  const token       = localStorage.getItem("token");
  const decoded     = jwtDecode(token);
  const studentId   = String(decoded._id || decoded.id || decoded.userId || decoded.sub || "");
  const studentName = decoded.name || "Student";

  const year = new Date().getFullYear();
  const [semType,    setSemType]    = useState(getCurrentSemesterType());
  const [semYear,    setSemYear]    = useState(year);
  const [activeTab,  setActiveTab]  = useState("dashboard");
  const [sections,   setSections]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(true);

  // ── Fetch sections ──
  useEffect(() => {
    if (!studentId) return;
    fetch(`${BASE_URL}/getSection?id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setSections(d.sections || []))
      .catch(console.error);
  }, [studentId]);

  // ── Fetch attendance records ──
  // FIX 1: param is "id" not "studentId" — matches backend controller's filter.$or
  // FIX 2: response key is "attendanceRecords" not "attendance"
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`${BASE_URL}/getAttendanceRecord?id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        const raw = Array.isArray(d)
          ? d
          : d.attendanceRecords || d.attendance || d.sessions || [];
        setAttendance(raw);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  // ── Safe string-to-string ID match ──
  const findMe = (rec) =>
    (rec.students || []).find(
      s => String(s.student?._id) === String(studentId)
    );

  // ── Semester range ──
  const { label: semLabel, start: semStart, end: semEnd } = getSemesterRange(semType, semYear);

  // ── Filter records: remove empty-student sessions, sessions where this student
  //    has no entry, and sessions outside the selected semester range ──
  // FIX 3: use parseDate() so "2026-04-25" doesn't shift back a day in UTC+5
  const semesterRecords = attendance.filter(rec => {
    if (!rec.students || rec.students.length === 0) return false;

    const me = rec.students.find(
      s => String(s.student?._id) === String(studentId)
    );
    if (!me) return false;

    const d = parseDate(rec.date);
    return d >= semStart && d <= semEnd;
  });

  // Active section IDs from filtered records
  const activeSectionIds = [...new Set(
    semesterRecords.map(r => r.section?._id).filter(Boolean)
  )];

  // Sections that match the semester records
  const semesterSections = sections.filter(s => activeSectionIds.includes(s._id));

  // ── Stats ──
  let totalPresent = 0, totalSessions = 0;
  let totalConf    = 0, confCount     = 0;

  semesterRecords.forEach(rec => {
    const me = findMe(rec);
    if (!me) return;
    totalSessions++;
    if (me.status?.toLowerCase() === "present") totalPresent++;
    if (me.confidenceScore != null) {
      totalConf += Number(me.confidenceScore);
      confCount++;
    }
  });

  const avgAttendance = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : null;
  const avgConf       = confCount     > 0 ? (totalConf / confCount).toFixed(1)               : null;

  const semTypes  = ["spring", "summer", "fall"];
  const yearRange = [year - 1, year, year + 1];

  const navBtns = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "courses",   label: "Courses",   icon: "📚" },
    { id: "profile",   label: "Profile",   icon: "👤" },
  ];

  return (
    <div className="min-h-screen w-full bg-zinc-800 text-white flex flex-col">
      <Navbar title="Student" user={studentName} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Nav */}
        <div className="w-[15%] bg-zinc-900 border-r-2 border-gray-600 flex flex-col items-center py-6 gap-4 h-screen">
          {navBtns.map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`flex items-center justify-center gap-2 p-2 w-40 font-bold rounded-sm cursor-pointer transition text-sm
                ${activeTab === btn.id
                  ? "bg-blue-500 text-white"
                  : "bg-blue-700 hover:bg-blue-900 text-white"}`}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ══ DASHBOARD ══ */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6">

              {/* Title + Semester Switcher */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-bold text-xl md:text-2xl">Dashboard Overview</h2>
                  <p className="text-gray-400 text-sm">{semLabel}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex gap-1 bg-zinc-900 border border-gray-600 rounded-md p-1">
                    {semTypes.map(t => (
                      <button
                        key={t}
                        onClick={() => setSemType(t)}
                        className={`px-3 py-1 rounded text-xs font-bold capitalize transition
                          ${semType === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 bg-zinc-900 border border-gray-600 rounded-md p-1">
                    {yearRange.map(y => (
                      <button
                        key={y}
                        onClick={() => setSemYear(y)}
                        className={`px-3 py-1 rounded text-xs font-bold transition
                          ${semYear === y ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <p className="text-gray-400 italic text-sm">Loading data…</p>
              ) : (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                      icon="✅" label="Avg Attendance" accent="green"
                      value={avgAttendance !== null ? `${avgAttendance}%` : "—"}
                      sub={totalSessions > 0
                        ? `${totalPresent} present / ${totalSessions} sessions`
                        : "No records this semester"}
                    />
                    <StatCard
                      icon="🎯" label="Avg Confidence Score" accent="blue"
                      value={avgConf !== null ? `${avgConf}%` : "—"}
                      sub="Face recognition confidence"
                    />
                    <StatCard
                      icon="📚" label="Courses Registered" accent="purple"
                      value={semesterSections.length || sections.length}
                      sub={semLabel}
                    />
                  </div>

                  {/* Per-course attendance bars */}
                  {semesterSections.length > 0 && (
                    <div className="bg-zinc-900 border-2 border-gray-600 rounded-xl p-5 flex flex-col gap-5">
                      <h3 className="font-bold text-base text-gray-200">Attendance by Course</h3>
                      {semesterSections.map(sec => {
                        const secRecs = semesterRecords.filter(r => r.section?._id === sec._id);
                        let sp = 0, sr = 0;
                        secRecs.forEach(rec => {
                          const me = findMe(rec);
                          if (!me) return;
                          sr++;
                          if (me.status?.toLowerCase() === "present") sp++;
                        });
                        const pct        = sr > 0 ? Math.round((sp / sr) * 100) : 0;
                        const courseName = sec.courseCode?.courseName || sec.courseCode?.courseCode || "Course";
                        return (
                          <div key={sec._id} className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-gray-200">
                                {courseName} — {sec.sectionName}
                              </span>
                              <span className={`font-bold ${pct >= 80 ? "text-green-400" : "text-red-400"}`}>
                                {pct}%
                              </span>
                            </div>
                            <AttBar pct={pct} />
                            <p className="text-xs text-gray-500">{sp} present / {sr} sessions</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {semesterSections.length === 0 && (
                    <div className="bg-zinc-900 border border-gray-600 rounded-xl p-8 text-center text-gray-400">
                      No attendance records found for{" "}
                      <span className="text-white font-semibold">{semLabel}</span>.
                      <br />
                      <span className="text-sm">Try switching the semester or year above.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "courses" && (
            <StCourse studentId={studentId} token={token} />
          )}

          {activeTab === "profile" && (
            <StProfile studentId={studentId} token={token} decoded={decoded} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDash;