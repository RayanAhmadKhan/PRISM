import React, { useState, useEffect } from "react";
import BASE_URL from '../../../config.js';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-form: Change Section
// ─────────────────────────────────────────────────────────────────────────────
const ChangeSection = () => {
  const [courses,         setCourses]         = useState([]);
  const [sections,        setSections]        = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(null);
  const [error,           setError]           = useState(null);
  const [formData,        setFormData]        = useState({
    rollNumber: "", courseId: "", oldSectionName: "", newSectionName: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getCourse`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.courseId) {
      setSections([]);
      setFormData(p => ({ ...p, oldSectionName: "", newSectionName: "" }));
      return;
    }
    setSectionsLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getSection?courseId=${formData.courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSections(d.sections || []); setFormData(p => ({ ...p, oldSectionName: "", newSectionName: "" })); })
      .catch(() => setError("Failed to load sections."))
      .finally(() => setSectionsLoading(false));
  }, [formData.courseId]);

  const handle = (field, value) => { setFormData(p => ({ ...p, [field]: value })); setError(null); setSuccess(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rollNumber, courseId, oldSectionName, newSectionName } = formData;
    if (!rollNumber.trim())                  return setError("Please enter a student roll number.");
    if (!courseId)                           return setError("Please select a course.");
    if (!oldSectionName)                     return setError("Please select the current section.");
    if (!newSectionName)                     return setError("Please select the target section.");
    if (oldSectionName === newSectionName)   return setError("Old and new sections cannot be the same.");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/changeSection`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber: rollNumber.trim(), courseId, oldSectionName, newSectionName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change section");
      setSuccess(`Student ${rollNumber.trim()} moved from "${oldSectionName}" → "${newSectionName}".`);
      setFormData(p => ({ ...p, rollNumber: "", oldSectionName: "", newSectionName: "" }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleReset = () => { setFormData({ rollNumber: "", courseId: "", oldSectionName: "", newSectionName: "" }); setSections([]); setError(null); setSuccess(null); };
  const selectedCourse = courses.find(c => c._id === formData.courseId);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <h2 className="font-bold text-xl text-white">Change Student Section</h2>
        <p className="text-gray-400 text-sm mt-1">Move a student from one section to another within the same course.</p>
      </div>

      {success && <div className="bg-green-900 border-2 border-green-600 p-3 rounded text-green-200">✅ {success}</div>}
      {error   && <div className="bg-red-900 border-2 border-red-600 p-3 rounded text-red-200">⚠️ {error}</div>}

      <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-6 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                <span className="text-blue-400 mr-2">01</span>Student Roll Number
              </label>
              <input type="text" value={formData.rollNumber} onChange={e => handle("rollNumber", e.target.value)}
                className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-blue-500 outline-none transition"
                placeholder="e.g. 23L-0742" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                <span className="text-blue-400 mr-2">02</span>Select Course
              </label>
              <select value={formData.courseId} onChange={e => handle("courseId", e.target.value)}
                className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-blue-500 outline-none transition">
                <option value="">— Choose a course —</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} · {c.courseName}</option>)}
              </select>
            </div>
          </div>

          {formData.courseId && (
            sectionsLoading
              ? <p className="text-gray-400 text-sm">Loading sections…</p>
              : sections.length === 0
                ? <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 text-sm p-3 rounded">No sections found for <strong>{selectedCourse?.courseName}</strong>.</div>
                : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-200">
                        <span className="text-blue-400 mr-2">03</span>Current Section
                      </label>
                      <select value={formData.oldSectionName} onChange={e => handle("oldSectionName", e.target.value)}
                        className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-blue-500 outline-none transition">
                        <option value="">— Select current section —</option>
                        {sections.map(s => <option key={s._id} value={s.sectionName}>{s.sectionName}{s.semester ? ` · ${s.semester}` : ""}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-200">
                        <span className="text-blue-400 mr-2">04</span>New Section
                      </label>
                      <select value={formData.newSectionName} onChange={e => handle("newSectionName", e.target.value)}
                        className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-blue-500 outline-none transition">
                        <option value="">— Select target section —</option>
                        {sections.filter(s => s.sectionName !== formData.oldSectionName)
                          .map(s => <option key={s._id} value={s.sectionName}>{s.sectionName}{s.semester ? ` · ${s.semester}` : ""}</option>)}
                      </select>
                    </div>
                  </div>
          )}

          {formData.rollNumber && formData.oldSectionName && formData.newSectionName && (
            <div className="bg-zinc-800 border border-blue-700 rounded p-4 text-sm text-gray-300">
              <p className="font-semibold text-blue-300 mb-2">Transfer Summary</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p>Student: <span className="text-white font-mono">{formData.rollNumber}</span></p>
                <p>Course: <span className="text-white">{selectedCourse?.courseName}</span></p>
                <p>Moving: <span className="text-red-400 font-semibold">{formData.oldSectionName}</span>{" → "}<span className="text-green-400 font-semibold">{formData.newSectionName}</span></p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-900 disabled:cursor-not-allowed p-2.5 rounded font-bold text-white transition">
              {loading ? "Changing…" : "Change Section"}
            </button>
            <button type="button" onClick={handleReset}
              className="flex-1 bg-gray-700 hover:bg-gray-600 p-2.5 rounded font-bold text-white transition">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-form: Enroll Student
// ─────────────────────────────────────────────────────────────────────────────
const EnrollStudent = () => {
  const [courses,         setCourses]         = useState([]);
  const [sections,        setSections]        = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(null);
  const [error,           setError]           = useState(null);
  const [formData,        setFormData]        = useState({ rollNumber: "", courseId: "", sectionName: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getCourse`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.courseId) { setSections([]); setFormData(p => ({ ...p, sectionName: "" })); return; }
    setSectionsLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getSection?courseId=${formData.courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSections(d.sections || []); setFormData(p => ({ ...p, sectionName: "" })); })
      .catch(() => setError("Failed to load sections."))
      .finally(() => setSectionsLoading(false));
  }, [formData.courseId]);

  const handle = (field, value) => { setFormData(p => ({ ...p, [field]: value })); setError(null); setSuccess(null); };
  const handleReset = () => { setFormData({ rollNumber: "", courseId: "", sectionName: "" }); setSections([]); setError(null); setSuccess(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rollNumber, courseId, sectionName } = formData;
    if (!rollNumber.trim()) return setError("Please enter a student roll number.");
    if (!courseId)          return setError("Please select a course.");
    if (!sectionName)       return setError("Please select a section.");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/addStudentInSection`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber: rollNumber.trim(), courseId, sectionName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to enroll student");
      const selectedCourse = courses.find(c => c._id === courseId);
      setSuccess(`Student "${rollNumber.trim()}" enrolled in "${sectionName}" of ${selectedCourse?.courseName}.`);
      setFormData(p => ({ ...p, rollNumber: "", sectionName: "" }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const selectedCourse = courses.find(c => c._id === formData.courseId);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <h2 className="font-bold text-xl text-white">Enroll Student in Section</h2>
        <p className="text-gray-400 text-sm mt-1">Add a student to a specific section within a course.</p>
      </div>

      {success && <div className="bg-green-900 border-2 border-green-600 p-3 rounded text-green-200">✅ {success}</div>}
      {error   && <div className="bg-red-900 border-2 border-red-600 p-3 rounded text-red-200">⚠️ {error}</div>}

      <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-6 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                <span className="text-blue-400 mr-2">01</span>Student Roll Number
              </label>
              <input type="text" value={formData.rollNumber} onChange={e => handle("rollNumber", e.target.value)}
                className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-blue-500 outline-none transition"
                placeholder="e.g. 23L-0742" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                <span className="text-blue-400 mr-2">02</span>Select Course
              </label>
              <select value={formData.courseId} onChange={e => handle("courseId", e.target.value)}
                className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-blue-500 outline-none transition">
                <option value="">— Choose a course —</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} · {c.courseName}</option>)}
              </select>
            </div>
          </div>

          {formData.courseId && (
            sectionsLoading
              ? <p className="text-gray-400 text-sm">Loading sections…</p>
              : sections.length === 0
                ? <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 text-sm p-3 rounded">No sections found for <strong>{selectedCourse?.courseName}</strong>.</div>
                : <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-200">
                      <span className="text-blue-400 mr-2">03</span>Select Section
                    </label>
                    <select value={formData.sectionName} onChange={e => handle("sectionName", e.target.value)}
                      className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-blue-500 outline-none transition">
                      <option value="">— Choose a section —</option>
                      {sections.map(s => <option key={s._id} value={s.sectionName}>{s.sectionName}{s.semester ? ` · ${s.semester}` : ""}</option>)}
                    </select>
                  </div>
          )}

          {formData.rollNumber && formData.courseId && formData.sectionName && (
            <div className="bg-zinc-800 border border-blue-700 rounded p-4 text-sm text-gray-300">
              <p className="font-semibold text-blue-300 mb-2">Enrollment Summary</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p>Student: <span className="text-white font-mono">{formData.rollNumber}</span></p>
                <p>Course: <span className="text-white">{selectedCourse?.courseName} ({selectedCourse?.courseCode})</span></p>
                <p>Section: <span className="text-green-400 font-semibold">{formData.sectionName}</span></p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-900 disabled:cursor-not-allowed p-2.5 rounded font-bold text-white transition">
              {loading ? "Enrolling…" : "Enroll Student"}
            </button>
            <button type="button" onClick={handleReset}
              className="flex-1 bg-gray-700 hover:bg-gray-600 p-2.5 rounded font-bold text-white transition">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-form: Remove Student
// ─────────────────────────────────────────────────────────────────────────────
const RemoveStudent = () => {
  const [courses,         setCourses]         = useState([]);
  const [sections,        setSections]        = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(null);
  const [error,           setError]           = useState(null);
  const [formData,        setFormData]        = useState({ rollNumber: "", courseId: "", sectionName: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getCourse`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.courseId) { setSections([]); setFormData(p => ({ ...p, sectionName: "" })); return; }
    setSectionsLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getSection?courseId=${formData.courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSections(d.sections || []); setFormData(p => ({ ...p, sectionName: "" })); })
      .catch(() => setError("Failed to load sections."))
      .finally(() => setSectionsLoading(false));
  }, [formData.courseId]);

  const handle = (field, value) => { setFormData(p => ({ ...p, [field]: value })); setError(null); setSuccess(null); };
  const handleReset = () => { setFormData({ rollNumber: "", courseId: "", sectionName: "" }); setSections([]); setError(null); setSuccess(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rollNumber, courseId, sectionName } = formData;
    if (!rollNumber.trim()) return setError("Please enter a student roll number.");
    if (!courseId)          return setError("Please select a course.");
    if (!sectionName)       return setError("Please select a section.");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/removeStudentFromSection`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber: rollNumber.trim(), sectionName, courseId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove student");
      const selectedCourse = courses.find(c => c._id === courseId);
      setSuccess(`Student "${rollNumber.trim()}" removed from "${sectionName}" of ${selectedCourse?.courseName}.`);
      setFormData(p => ({ ...p, rollNumber: "", sectionName: "" }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const selectedCourse = courses.find(c => c._id === formData.courseId);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <h2 className="font-bold text-xl text-white">Remove Student from Section</h2>
        <p className="text-gray-400 text-sm mt-1">Unenroll a student from a specific section within a course.</p>
      </div>

      {success && <div className="bg-green-900 border-2 border-green-600 p-3 rounded text-green-200">✅ {success}</div>}
      {error   && <div className="bg-red-900 border-2 border-red-600 p-3 rounded text-red-200">⚠️ {error}</div>}

      <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-6 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                <span className="text-red-400 mr-2">01</span>Student Roll Number
              </label>
              <input type="text" value={formData.rollNumber} onChange={e => handle("rollNumber", e.target.value)}
                className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-red-500 outline-none transition"
                placeholder="e.g. 23L-0742" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                <span className="text-red-400 mr-2">02</span>Select Course
              </label>
              <select value={formData.courseId} onChange={e => handle("courseId", e.target.value)}
                className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-red-500 outline-none transition">
                <option value="">— Choose a course —</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} · {c.courseName}</option>)}
              </select>
            </div>
          </div>

          {formData.courseId && (
            sectionsLoading
              ? <p className="text-gray-400 text-sm">Loading sections…</p>
              : sections.length === 0
                ? <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 text-sm p-3 rounded">No sections found for <strong>{selectedCourse?.courseName}</strong>.</div>
                : <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-200">
                      <span className="text-red-400 mr-2">03</span>Select Section
                    </label>
                    <select value={formData.sectionName} onChange={e => handle("sectionName", e.target.value)}
                      className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-red-500 outline-none transition">
                      <option value="">— Choose a section —</option>
                      {sections.map(s => <option key={s._id} value={s.sectionName}>{s.sectionName}{s.semester ? ` · Semester ${s.semester}` : ""}</option>)}
                    </select>
                  </div>
          )}

          {formData.rollNumber && formData.courseId && formData.sectionName && (
            <div className="bg-zinc-800 border border-red-700 rounded p-4 text-sm text-gray-300">
              <p className="font-semibold text-red-300 mb-2">Removal Summary</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p>Student: <span className="text-white font-mono">{formData.rollNumber}</span></p>
                <p>Course: <span className="text-white">{selectedCourse?.courseName} ({selectedCourse?.courseCode})</span></p>
                <p>Removing from: <span className="text-red-400 font-semibold">{formData.sectionName}</span></p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-900 disabled:cursor-not-allowed p-2.5 rounded font-bold text-white transition">
              {loading ? "Removing…" : "Remove Student"}
            </button>
            <button type="button" onClick={handleReset}
              className="flex-1 bg-gray-700 hover:bg-gray-600 p-2.5 rounded font-bold text-white transition">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main: AdSectionManagement
// ─────────────────────────────────────────────────────────────────────────────
const AdSectionManagment = () => {
  const [activeTab,       setActiveTab]       = useState("manage");
  const [sections,        setSections]        = useState([]);
  const [courses,         setCourses]         = useState([]);
  const [instructors,     setInstructors]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [success,         setSuccess]         = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingSection,  setEditingSection]  = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [formData, setFormData] = useState({
    sectionName: "", semester: "", year: "", courseCode: "", instructor: ""
  });
  const [editFormData, setEditFormData] = useState({
    sectionName: "", semester: "", year: "", courseCode: "", instructor: ""
  });

  useEffect(() => { fetchSections(); fetchCourses(); fetchInstructors(); }, []);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/getSection`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch sections");
      const data = await response.json();
      const formatted = (data.sections || []).map(section => ({
        id:                 section._id,
        sectionName:        section.sectionName,
        courseCode:         section.courseCode?.courseCode   || "N/A",
        courseObjectId:     section.courseCode?._id          || "",
        courseName:         section.courseCode?.courseName   || "N/A",
        semester:           section.semester                 || "N/A",
        year:               section.year                     || "N/A",
        instructor:         section.instructor?.name         || "Unassigned",
        instructorObjectId: section.instructor?._id          || "",
        instructorID:       section.instructor?.instructorID || "N/A",
        students: (section.students || []).map(s => ({
          name:       s.name       || "Unknown",
          rollNumber: s.rollNumber || "N/A"
        })),
        status: "Active"
      }));
      setSections(formatted);
      setError(null);
    } catch { setError("Failed to load sections"); }
    finally { setLoading(false); }
  };

  const fetchCourses = () => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getCourse`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(console.error);
  };

  const fetchInstructors = () => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/getAllUsers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setInstructors(d.instructors || [])).catch(console.error);
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/section`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      setSuccess("Section added successfully!");
      setShowAddModal(false);
      setFormData({ sectionName: "", semester: "", year: "", courseCode: "", instructor: "" });
      fetchSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message || "Failed to add section"); setTimeout(() => setError(null), 3000); }
  };

  const handleEditOpen = (section) => {
    setEditingSection(section);
    setEditFormData({
      sectionName: section.sectionName === "N/A" ? "" : section.sectionName,
      semester:    section.semester    === "N/A" ? "" : section.semester,
      year:        section.year        === "N/A" ? "" : String(section.year),
      courseCode:  section.courseObjectId        || "",
      instructor:  section.instructorObjectId    || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const body = { sectionId: editingSection.id };
      if (editFormData.sectionName.trim()) body.sectionName = editFormData.sectionName.trim();
      if (editFormData.semester.trim())    body.semester    = editFormData.semester.trim();
      if (editFormData.year)               body.year        = editFormData.year;
      if (editFormData.courseCode)         body.courseCode  = editFormData.courseCode;
      if (editFormData.instructor)         body.instructor  = editFormData.instructor;
      const res = await fetch(`${BASE_URL}/updateSection`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      setSuccess("Section updated successfully!");
      setShowEditModal(false);
      setEditingSection(null);
      if (selectedSection?.id === editingSection.id) setSelectedSection(null);
      fetchSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message || "Failed to update section"); setTimeout(() => setError(null), 3000); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/deleteSection?sectionId=${sectionId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to delete section");
      setSuccess("Section deleted successfully!");
      if (selectedSection?.id === sectionId) setSelectedSection(null);
      fetchSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Failed to delete section"); setTimeout(() => setError(null), 3000); }
  };

  const filteredSections = sections.filter(s =>
    s.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: "manage", label: "Manage Sections" },
    { id: "change", label: "Change Section"  },
    { id: "enroll", label: "Enroll Student"  },
    { id: "remove", label: "Remove Student"  },
  ];

  if (loading) return <div className="p-6 text-gray-400">Loading sections…</div>;

  return (
    <div className="w-full p-4 md:p-6 flex flex-col gap-5">

      {success && <div className="bg-green-900 border-2 border-green-600 p-3 rounded text-green-200">✓ {success}</div>}
      {error   && <div className="bg-red-900 border-2 border-red-600 p-3 rounded text-red-200">✗ {error}</div>}

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap border-b-2 border-gray-600 pb-3">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition text-sm
              ${activeTab === tab.id
                ? "bg-blue-700 text-white border-b-2 border-blue-400"
                : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ Manage Sections ══ */}
      {activeTab === "manage" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
            <h2 className="font-bold text-xl text-white">Section Management</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input type="text" placeholder="Search sections…"
                className="bg-zinc-800 p-2.5 rounded-lg border-2 border-gray-600 text-white focus:outline-none focus:border-blue-600 w-full sm:w-64"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <button onClick={() => setShowAddModal(true)}
                className="bg-blue-700 hover:bg-blue-800 px-5 py-2.5 font-bold rounded-lg text-white transition whitespace-nowrap">
                + Add Section
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-gray-600 rounded-lg bg-zinc-900">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800 border-b-2 border-gray-600">
                <tr>
                  {["Section Name","Course","Semester","Year","Instructor","Students","Actions"].map(h => (
                    <th key={h} className="p-4 text-left font-bold text-white">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSections.length > 0 ? filteredSections.map((section, idx) => (
                  <tr key={idx}
                    onClick={() => setSelectedSection(selectedSection?.id === section.id ? null : section)}
                    className={`border-b border-gray-600 cursor-pointer transition text-gray-100
                      ${selectedSection?.id === section.id
                        ? "bg-blue-900/30 border-l-4 border-l-blue-400"
                        : "hover:bg-zinc-800"}`}>
                    <td className="p-4 font-semibold text-blue-300">{section.sectionName}</td>
                    <td className="p-4">{section.courseCode}</td>
                    <td className="p-4">{section.semester}</td>
                    <td className="p-4">{section.year}</td>
                    <td className="p-4">{section.instructor}</td>
                    <td className="p-4">
                      <span className="bg-blue-800 px-3 py-1 rounded-full text-blue-200 text-xs font-semibold">
                        {section.students.length}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); handleEditOpen(section); }}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm font-bold text-white transition">Edit</button>
                        <button onClick={e => { e.stopPropagation(); handleDeleteSection(section.id); }}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold text-white transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="p-4 text-center text-gray-400">No sections found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Panel */}
          {selectedSection && (
            <div className="bg-zinc-900 border-2 border-blue-600 rounded-lg p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedSection.sectionName}</h3>
                  <p className="text-blue-400 text-sm">{selectedSection.courseCode} · {selectedSection.courseName}</p>
                </div>
                <button onClick={() => setSelectedSection(null)} className="text-gray-400 hover:text-white text-2xl font-bold leading-none">✕</button>
              </div>
              <hr className="border-gray-600" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Course",         main: selectedSection.courseName,          sub: selectedSection.courseCode },
                  { label: "Semester / Year",main: `Semester ${selectedSection.semester}`, sub: String(selectedSection.year) },
                  { label: "Instructor",     main: selectedSection.instructor,          sub: `ID: ${selectedSection.instructorID}` },
                  { label: "Total Students", main: selectedSection.students.length,     sub: null, big: true }
                ].map(({ label, main, sub, big }) => (
                  <div key={label} className="bg-zinc-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-500 text-xs mb-1">{label}</p>
                    <p className={`text-white font-semibold ${big ? "text-2xl font-bold" : "text-sm"}`}>{main}</p>
                    {sub && <p className="text-gray-400 text-xs">{sub}</p>}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-300 mb-3">
                  Enrolled Students
                  <span className="ml-2 bg-blue-800 text-blue-200 text-xs px-2 py-0.5 rounded-full">{selectedSection.students.length}</span>
                </h4>
                {selectedSection.students.length === 0 ? (
                  <div className="bg-zinc-800 border border-gray-600 rounded-lg p-4 text-center text-gray-400 text-sm">No students enrolled.</div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {selectedSection.students.map((student, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-2 transition border border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-5">{idx + 1}.</span>
                          <p className="text-white text-sm font-medium">{student.name}</p>
                        </div>
                        <span className="text-gray-400 text-xs font-mono">{student.rollNumber}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "change" && <ChangeSection />}
      {activeTab === "enroll" && <EnrollStudent />}
      {activeTab === "remove" && <RemoveStudent />}

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Section</h2>
            <form onSubmit={handleAddSection} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Section Name</label>
                <input type="text" required placeholder="e.g., Section A" value={formData.sectionName}
                  onChange={e => setFormData({ ...formData, sectionName: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Course</label>
                <select required value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600">
                  <option value="">Select a course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Semester</label>
                <select required value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600">
                  <option value="">Select Semester</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Year</label>
                <input type="text" required placeholder="e.g., 2024" value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Instructor</label>
                <select required value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600">
                  <option value="">Select an instructor</option>
                  {instructors.map(inst => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition">Add Section</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border-2 border-yellow-600 rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-1 text-white">Edit Section</h2>
            <p className="text-gray-400 text-sm mb-6">
              Editing: <span className="text-yellow-400 font-semibold">{editingSection.sectionName}</span> · {editingSection.courseCode}
              {" — only fill fields you want to update."}
            </p>
            <form onSubmit={handleUpdateSection} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Section Name</label>
                <input type="text" value={editFormData.sectionName}
                  onChange={e => setEditFormData({ ...editFormData, sectionName: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Leave blank to keep current" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Course</label>
                <select value={editFormData.courseCode} onChange={e => setEditFormData({ ...editFormData, courseCode: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                  <option value="">— Keep current —</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Semester</label>
                <select value={editFormData.semester} onChange={e => setEditFormData({ ...editFormData, semester: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                  <option value="">— Keep current —</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Year</label>
                <input type="text" value={editFormData.year}
                  onChange={e => setEditFormData({ ...editFormData, year: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Leave blank to keep current" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Instructor</label>
                <select value={editFormData.instructor} onChange={e => setEditFormData({ ...editFormData, instructor: e.target.value })}
                  className="w-full bg-zinc-800 p-3 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                  <option value="">— Keep current —</option>
                  {instructors.map(inst => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingSection(null); }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition">Update Section</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdSectionManagment;