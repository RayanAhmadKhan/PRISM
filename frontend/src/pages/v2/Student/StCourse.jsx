import React, { useState, useEffect } from "react";

// Safe date parser — "2026-04-25" won't shift back a day in UTC+5
const parseDate = (str) => {
  if (!str) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + "T12:00:00");
  return new Date(str);
};

const semLabel = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

const formatDate = (str) =>
  str
    ? parseDate(str).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// Attendance bar
const AttBar = ({ pct }) => {
  const barColor  = pct >= 80 ? "bg-green-500"   : pct >= 60 ? "bg-yellow-500"  : "bg-red-500";
  const textColor = pct >= 80 ? "text-green-400"  : pct >= 60 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Attendance</span>
        <span className={`font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StCourse = ({ studentId, token }) => {
  const [sections,   setSections]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [filterSem,  setFilterSem]  = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);

  // ── Fetch sections ──
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`http://localhost:5000/getSection?id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setSections(d.sections || []))
      .catch(() => setError("Failed to load courses. Please try again."))
      .finally(() => setLoading(false));
  }, [studentId]);

  // ── Fetch attendance records ──
  // FIX: must be "id" not "studentId" — backend controller uses filter.$or on "id"
  useEffect(() => {
    if (!studentId) return;
    fetch(`http://localhost:5000/getAttendanceRecord?id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const raw = Array.isArray(d)
          ? d
          : d.attendanceRecords || d.attendance || d.sessions || [];
        setAttendance(raw);
      })
      .catch(console.error);
  }, [studentId]);

  // ── Per-section attendance stats ──
  const getAttendanceStats = (sectionId) => {
    let present = 0, total = 0;
    attendance.forEach((rec) => {
      if (rec.section?._id !== sectionId) return;
      const me = (rec.students || []).find(
        (s) => String(s.student?._id) === String(studentId)
      );
      if (!me) return;
      total++;
      if (me.status?.toLowerCase() === "present") present++;
    });
    const pct = total > 0 ? Math.round((present / total) * 100) : null;
    return { present, total, pct };
  };

  // ── Session records for a section, newest first ──
  const getSessionRecords = (sectionId) =>
    attendance
      .filter((rec) => {
        if (rec.section?._id !== sectionId) return false;
        return (rec.students || []).some(
          (s) => String(s.student?._id) === String(studentId)
        );
      })
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  // ── Filter options ──
  const semOptions  = [...new Set(sections.map((s) => s.semester?.toLowerCase()).filter(Boolean))];
  const yearOptions = [...new Set(sections.map((s) => String(s.year)).filter(Boolean))].sort();

  const filtered = sections.filter((s) => {
    const matchSem    = filterSem  === "all" || s.semester?.toLowerCase() === filterSem;
    const matchYear   = filterYear === "all" || String(s.year) === filterYear;
    const courseName  = s.courseCode?.courseName || s.courseCode?.courseCode || "";
    const secName     = s.sectionName || "";
    const matchSearch =
      search.trim() === "" ||
      courseName.toLowerCase().includes(search.toLowerCase()) ||
      secName.toLowerCase().includes(search.toLowerCase());
    return matchSem && matchYear && matchSearch;
  });

  if (loading) return <p className="text-gray-400 italic text-sm">Loading courses…</p>;
  if (error)   return <p className="text-red-400 text-sm">{error}</p>;

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Header */}
      <div>
        <h2 className="font-bold text-xl md:text-2xl">My Courses</h2>
        <p className="text-gray-400 text-sm">
          {sections.length} section{sections.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-semibold">Search</label>
          <input
            type="text"
            placeholder="Course or section name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border-2 border-gray-600 text-white p-2 rounded-sm text-sm min-w-[180px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-semibold">Semester</label>
          <select
            value={filterSem}
            onChange={(e) => setFilterSem(e.target.value)}
            className="bg-zinc-900 border-2 border-gray-600 text-white p-2 rounded-sm text-sm"
          >
            <option value="all">All Semesters</option>
            {semOptions.map((s) => (
              <option key={s} value={s}>{semLabel(s)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-semibold">Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-zinc-900 border-2 border-gray-600 text-white p-2 rounded-sm text-sm"
          >
            <option value="all">All Years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {(filterSem !== "all" || filterYear !== "all" || search) && (
          <button
            onClick={() => { setFilterSem("all"); setFilterYear("all"); setSearch(""); }}
            className="text-xs text-gray-400 hover:text-white underline pb-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-gray-600 rounded-xl p-8 text-center text-gray-400">
          No courses match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sec) => {
            const courseName = sec.courseCode?.courseName || "—";
            const courseCode = sec.courseCode?.courseCode || "—";
            const instrName  = sec.instructor?.name       || "—";
            const { present, total, pct } = getAttendanceStats(sec._id);

            return (
              <div
                key={sec._id}
                onClick={() => setSelected(sec)}
                className="bg-zinc-900 border-2 border-gray-600 hover:border-blue-500 rounded-xl p-5
                           flex flex-col gap-3 cursor-pointer transition-colors"
              >
                {/* Badge + name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono bg-blue-900/40 text-blue-300 border border-blue-700 px-2 py-0.5 rounded w-fit">
                      {courseCode}
                    </span>
                    <h3 className="font-bold text-base text-white leading-tight">{courseName}</h3>
                  </div>
                  <span className="text-xs bg-zinc-700 text-gray-300 px-2 py-1 rounded shrink-0">
                    {sec.sectionName}
                  </span>
                </div>

                {/* Info rows */}
                <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Instructor</span>
                    <span className="text-gray-200 font-semibold">{instrName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Semester</span>
                    <span className="text-gray-200">{semLabel(sec.semester)} {sec.year}</span>
                  </div>
                </div>

                {/* Attendance bar */}
                {pct !== null ? (
                  <div className="mt-1">
                    <AttBar pct={pct} />
                    <p className="text-xs text-gray-500 mt-1">{present} present / {total} sessions</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-1">No attendance records yet</p>
                )}

                <p className="text-xs text-blue-400 mt-auto">Click to view details →</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (() => {
        const { present, total, pct } = getAttendanceStats(selected._id);
        const sessionRecords = getSessionRecords(selected._id);

        return (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-zinc-900 border-2 border-blue-600 rounded-xl w-full max-w-lg
                         flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex justify-between items-start p-6 pb-4 border-b border-zinc-700">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono bg-blue-900/40 text-blue-300 border border-blue-700 px-2 py-0.5 rounded w-fit">
                    {selected.courseCode?.courseCode || "—"}
                  </span>
                  <h2 className="font-bold text-xl">{selected.courseCode?.courseName || "—"}</h2>
                  <p className="text-gray-400 text-sm">
                    {selected.sectionName} · Semester {semLabel(selected.semester)} {selected.year}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-white text-2xl leading-none ml-4"
                >✕</button>
              </div>

              {/* Attendance summary bar */}
              <div className="px-6 py-4 border-b border-zinc-700">
                {pct !== null ? (
                  <div className="flex flex-col gap-2">
                    <AttBar pct={pct} />
                    <p className="text-xs text-gray-500">
                      {present} present out of {total} sessions
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No attendance records yet.</p>
                )}
              </div>

              {/* Session list — scrollable */}
              <div className="flex flex-col gap-3 p-6 overflow-y-auto flex-1">
                {sessionRecords.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No sessions recorded.</p>
                ) : (
                  <>
                    {/* Table header */}
                    <div className="grid grid-cols-4 text-xs text-gray-400 font-semibold uppercase tracking-wide px-3">
                      <span>#</span>
                      <span className="col-span-2">Date</span>
                      <span>Status</span>
                    </div>

                    {sessionRecords.map((rec, i) => {
                      const me = (rec.students || []).find(
                        (s) => String(s.student?._id) === String(studentId)
                      );
                      const status    = me?.status || "—";
                      const isPresent = status.toLowerCase() === "present";
                      const conf      = me?.confidenceScore != null
                        ? `${me.confidenceScore}%`
                        : null;

                      return (
                        <div
                          key={rec._id}
                          className="grid grid-cols-4 items-center bg-zinc-800 rounded-lg px-3 py-3 border border-zinc-700"
                        >
                          {/* Row number */}
                          <span className="text-gray-500 text-sm">{i + 1}</span>

                          {/* Date + confidence */}
                          <div className="col-span-2 flex flex-col gap-0.5">
                            <span className="text-gray-200 font-semibold text-sm">
                              {formatDate(rec.date)}
                            </span>
                            {conf && (
                              <span className="text-xs text-gray-500 font-mono">
                                {conf} confidence
                              </span>
                            )}
                          </div>

                          {/* Status badge */}
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded text-center w-fit ${
                              isPresent
                                ? "bg-green-800 text-green-200"
                                : "bg-red-800 text-red-200"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 border-t border-zinc-700">
                <button
                  onClick={() => setSelected(null)}
                  className="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-md font-bold text-sm w-full transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default StCourse;