import React, { useState, useEffect } from "react";

const AdRemoveStudent = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    rollNumber: "",
    courseId: "",
    sectionName: ""
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/getCourse", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        setError("Failed to load courses. Please refresh.");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!formData.courseId) {
      setSections([]);
      setFormData((prev) => ({ ...prev, sectionName: "" }));
      return;
    }

    const fetchSections = async () => {
      try {
        setSectionsLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/getSection?courseId=${formData.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data = await res.json();
        setSections(data.sections || []);
        setFormData((prev) => ({ ...prev, sectionName: "" }));
      } catch (err) {
        setError("Failed to load sections for this course.");
      } finally {
        setSectionsLoading(false);
      }
    };

    fetchSections();
  }, [formData.courseId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rollNumber, courseId, sectionName } = formData;

    if (!rollNumber.trim()) return setError("Please enter a student roll number.");
    if (!courseId)          return setError("Please select a course.");
    if (!sectionName)       return setError("Please select a section.");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/removeStudentFromSection", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rollNumber: rollNumber.trim(),
          sectionName,
          courseId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove student");

      const selectedCourse = courses.find((c) => c._id === courseId);
      setSuccess(
        `Student "${rollNumber.trim()}" successfully removed from section "${sectionName}" of ${selectedCourse?.courseName}.`
      );
      setFormData((prev) => ({ ...prev, rollNumber: "", sectionName: "" }));
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ rollNumber: "", courseId: "", sectionName: "" });
    setSections([]);
    setError(null);
    setSuccess(null);
  };

  const selectedCourse = courses.find((c) => c._id === formData.courseId);

  return (
    <div className="p-3 md:p-5 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-lg md:text-xl text-white">
          Remove Student from Section
        </h1>
        <p className="text-gray-400 text-sm">
          Unenroll a student from a specific section within a course.
        </p>
      </div>

      {success && (
        <div className="bg-green-900 border-2 border-green-600 p-3 rounded text-green-200 flex items-start gap-2">
          <span className="mt-0.5">✅</span>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-900 border-2 border-red-600 p-3 rounded text-red-200 flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-5 md:p-8 w-full max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-200">
              <span className="text-red-400 mr-2">01</span> Student Roll Number
            </label>
            <input
              type="text"
              value={formData.rollNumber}
              onChange={(e) => handleChange("rollNumber", e.target.value)}
              className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-red-500 outline-none transition"
              placeholder="e.g. 2021-CS-101"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-200">
              <span className="text-red-400 mr-2">02</span> Select Course
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => handleChange("courseId", e.target.value)}
              className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-red-500 outline-none transition"
            >
              <option value="">— Choose a course —</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} · {course.courseName}
                </option>
              ))}
            </select>
          </div>

          {formData.courseId && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                <span className="text-red-400 mr-2">03</span> Select Section
              </label>

              {sectionsLoading ? (
                <p className="text-gray-400 text-sm">Loading sections...</p>
              ) : sections.length === 0 ? (
                <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 text-sm p-3 rounded">
                  No sections found for <strong>{selectedCourse?.courseName}</strong>.
                </div>
              ) : (
                <select
                  value={formData.sectionName}
                  onChange={(e) => handleChange("sectionName", e.target.value)}
                  className="w-full bg-zinc-800 p-2.5 border-2 border-gray-600 rounded text-white focus:border-red-500 outline-none transition"
                >
                  <option value="">— Choose a section —</option>
                  {sections.map((section) => (
                    <option key={section._id} value={section.sectionName}>
                      {section.sectionName}
                      {section.semester ? ` · Semester ${section.semester}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {formData.rollNumber && formData.courseId && formData.sectionName && (
            <div className="bg-zinc-800 border border-red-700 rounded p-3 text-sm text-gray-300">
              <p className="font-semibold text-red-300 mb-1">Removal Summary</p>
              <p>Student: <span className="text-white font-mono">{formData.rollNumber}</span></p>
              <p>Course: <span className="text-white">{selectedCourse?.courseName} ({selectedCourse?.courseCode})</span></p>
              <p>
                Removing from:{" "}
                <span className="text-red-400 font-semibold">{formData.sectionName}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-900 disabled:cursor-not-allowed p-2.5 rounded font-bold text-white transition"
            >
              {loading ? "Removing..." : "Remove Student"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-700 hover:bg-gray-600 p-2.5 rounded font-bold text-white transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdRemoveStudent;
