import React, { useState, useEffect } from "react";

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({
    sectionName: "",
    semester: "",
    year: "",
    courseCode: "",
    instructor: ""
  });
  const [editFormData, setEditFormData] = useState({
    sectionName: "",
    semester: "",
    year: "",
    courseCode: "",
    instructor: ""
  });

  useEffect(() => {
    fetchSections();
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/getSection", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to fetch sections");

      const data = await response.json();
      const formattedSections = (data.sections || []).map((section) => ({
        id: section._id,
        sectionName: section.sectionName,
        courseCode: section.courseCode?.courseCode || "N/A",
        courseObjectId: section.courseCode?._id || "",
        courseName: section.courseCode?.courseName || "N/A",
        semester: section.semester || "N/A",
        year: section.year || "N/A",
        instructor: section.instructor?.name || "Unassigned",
        instructorObjectId: section.instructor?._id || "",
        instructorID: section.instructor?.instructorID || "N/A",
        students: (section.students || []).map((s) => ({
          name: s.name || "Unknown",
          rollNumber: s.rollNumber || "N/A"
        })),
        status: "Active"
      }));

      setSections(formattedSections);
      setError(null);
    } catch (err) {
      setError("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/getCourse", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/getAllUsers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setInstructors(data.instructors || []);
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/section", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to add section");
      }

      setSuccess("Section added successfully!");
      setShowAddModal(false);
      setFormData({
        sectionName: "",
        semester: "",
        year: "",
        courseCode: "",
        instructor: ""
      });
      fetchSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to add section");
    }
  };

  // Pre-fill edit form with the section's current ObjectIds so dropdowns show the right selection
  const handleEditOpen = (section) => {
    setEditingSection(section);
    setEditFormData({
      sectionName: section.sectionName === "N/A" ? "" : section.sectionName,
      semester: section.semester === "N/A" ? "" : section.semester,
      year: section.year === "N/A" ? "" : String(section.year),
      courseCode: section.courseObjectId || "",
      instructor: section.instructorObjectId || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Only include fields that were actually filled / changed
      const body = { sectionId: editingSection.id };
      if (editFormData.sectionName.trim())
        body.sectionName = editFormData.sectionName.trim();
      if (editFormData.semester.trim())
        body.semester = editFormData.semester.trim();
      if (editFormData.year) body.year = editFormData.year;
      if (editFormData.courseCode) body.courseCode = editFormData.courseCode;
      if (editFormData.instructor) body.instructor = editFormData.instructor;

      const response = await fetch("http://localhost:5000/updateSection", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update section");
      }

      setSuccess("Section updated successfully!");
      setShowEditModal(false);
      setEditingSection(null);
      if (selectedSection?.id === editingSection.id) setSelectedSection(null);
      fetchSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/deleteSection?sectionId=${sectionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) throw new Error("Failed to delete section");

      setSuccess("Section deleted successfully!");
      if (selectedSection?.id === sectionId) setSelectedSection(null);
      fetchSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete section");
    }
  };

  if (loading) {
    return (
      <div className="p-3 md:p-5">
        <p className="text-gray-400">Loading sections...</p>
      </div>
    );
  }

  const filteredSections = sections.filter(
    (section) =>
      section.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 md:p-5 flex flex-col gap-5">
      {/* Alerts */}
      {success && (
        <div className="bg-green-900 border-2 border-green-600 p-3 rounded text-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-900 border-2 border-red-600 p-3 rounded text-red-200">
          {error}
        </div>
      )}

      <div className="header w-full flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <h1 className="font-bold text-lg md:text-xl">Section Management</h1>
        <div className="side-btns flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="text"
            placeholder="Search sections..."
            className="bg-zinc-900 p-2 w-full sm:w-47 font-bold rounded-sm border-2 border-gray-600 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-700 w-full sm:w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900"
          >
            + Add Section
          </button>
        </div>
      </div>

      {/* Main layout — table + detail panel */}
      <div
        className={`flex gap-4 ${selectedSection ? "flex-col lg:flex-row" : ""}`}
      >
        {/* Sections Table */}
        <div
          className={`overflow-x-auto border-2 border-gray-600 rounded-md ${selectedSection ? "lg:w-1/2" : "w-full"}`}
        >
          <table className="w-full text-sm md:text-base">
            <thead className="bg-zinc-900 border-b-2 border-gray-600">
              <tr>
                <th className="p-3 text-left font-bold">Section Name</th>
                <th className="p-3 text-left font-bold">Course Code</th>
                <th className="p-3 text-left font-bold">Semester</th>
                <th className="p-3 text-left font-bold">Year</th>
                <th className="p-3 text-left font-bold">Instructor</th>
                <th className="p-3 text-left font-bold">Status</th>
                <th className="p-3 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.length > 0 ? (
                filteredSections.map((section, idx) => (
                  <tr
                    key={idx}
                    onClick={() =>
                      setSelectedSection(
                        selectedSection?.id === section.id ? null : section
                      )
                    }
                    className={`border-b border-gray-600 cursor-pointer transition
                      ${
                        selectedSection?.id === section.id
                          ? "bg-blue-900 border-l-4 border-l-blue-400"
                          : "hover:bg-zinc-700"
                      }`}
                  >
                    <td className="p-3 font-semibold">{section.sectionName}</td>
                    <td className="p-3">{section.courseCode}</td>
                    <td className="p-3">{section.semester}</td>
                    <td className="p-3">{section.year}</td>
                    <td className="p-3">{section.instructor}</td>
                    <td className="p-3">
                      <span className="bg-green-900 px-2 py-1 rounded">
                        {section.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOpen(section);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-400">
                    No sections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section Detail Panel */}
        {selectedSection && (
          <div className="lg:w-1/2 bg-zinc-900 border-2 border-blue-600 rounded-lg p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedSection.sectionName}
                </h2>
                <p className="text-blue-400 text-sm">
                  {selectedSection.courseCode} · {selectedSection.courseName}
                </p>
              </div>
              <button
                onClick={() => setSelectedSection(null)}
                className="text-gray-400 hover:text-white text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            <hr className="border-gray-600" />

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800 rounded p-3">
                <p className="text-gray-400 text-xs mb-1">Course</p>
                <p className="text-white text-sm font-semibold">
                  {selectedSection.courseName}
                </p>
                <p className="text-gray-400 text-xs">
                  {selectedSection.courseCode}
                </p>
              </div>
              <div className="bg-zinc-800 rounded p-3">
                <p className="text-gray-400 text-xs mb-1">Semester / Year</p>
                <p className="text-white text-sm font-semibold">
                  Semester {selectedSection.semester}
                </p>
                <p className="text-gray-400 text-xs">{selectedSection.year}</p>
              </div>
              <div className="bg-zinc-800 rounded p-3">
                <p className="text-gray-400 text-xs mb-1">Instructor</p>
                <p className="text-white text-sm font-semibold">
                  {selectedSection.instructor}
                </p>
                <p className="text-gray-400 text-xs">
                  ID: {selectedSection.instructorID}
                </p>
              </div>
              <div className="bg-zinc-800 rounded p-3">
                <p className="text-gray-400 text-xs mb-1">Total Students</p>
                <p className="text-white text-2xl font-bold">
                  {selectedSection.students.length}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-300 mb-2">
                Enrolled Students
                <span className="ml-2 bg-blue-800 text-blue-200 text-xs px-2 py-0.5 rounded-full">
                  {selectedSection.students.length}
                </span>
              </h3>

              {selectedSection.students.length === 0 ? (
                <div className="bg-zinc-800 border border-gray-600 rounded p-4 text-center text-gray-400 text-sm">
                  No students enrolled in this section.
                </div>
              ) : (
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                  {selectedSection.students.map((student, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 rounded px-3 py-2 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs w-5">
                          {idx + 1}.
                        </span>
                        <p className="text-white text-sm font-medium">
                          {student.name}
                        </p>
                      </div>
                      <span className="text-gray-400 text-xs font-mono">
                        {student.rollNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Section Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-5 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-5">
              Add New Section
            </h2>

            <form onSubmit={handleAddSection} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.sectionName}
                  onChange={(e) =>
                    setFormData({ ...formData, sectionName: e.target.value })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                  placeholder="e.g., Section A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Course
                </label>
                <select
                  required
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Semester
                </label>

                <select
                  required
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                >
                  <option value="">Select Semester</option>
                  <option value="Spring">Spring</option>
                  <option value="Fall">Fall</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Year</label>
                <input
                  type="text"
                  required
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                  placeholder="e.g., 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Instructor
                </label>
                <select
                  required
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                >
                  <option value="">Select an instructor</option>
                  {instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 hover:bg-blue-800 p-2 rounded font-bold"
                >
                  Add Section
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 p-2 rounded font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Section Modal ── */}
      {showEditModal && editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-zinc-900 border-2 border-yellow-600 rounded-lg p-5 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-1">Edit Section</h2>
            <p className="text-gray-400 text-sm mb-5">
              Editing:{" "}
              <span className="text-yellow-400 font-semibold">
                {editingSection.sectionName}
              </span>
              {" · "}
              <span className="text-gray-300">{editingSection.courseCode}</span>
              {" — only fill the fields you want to update."}
            </p>

            <form
              onSubmit={handleUpdateSection}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={editFormData.sectionName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      sectionName: e.target.value
                    })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Course
                </label>
                <select
                  value={editFormData.courseCode}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      courseCode: e.target.value
                    })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                >
                  <option value="">— Keep current course —</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  value={editFormData.semester}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      semester: e.target.value
                    })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Year</label>
                <input
                  type="text"
                  value={editFormData.year}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, year: e.target.value })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Instructor
                </label>
                <select
                  value={editFormData.instructor}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      instructor: e.target.value
                    })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                >
                  <option value="">— Keep current instructor —</option>
                  {instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 p-2 rounded font-bold"
                >
                  Update Section
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSection(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 p-2 rounded font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionManagement;
