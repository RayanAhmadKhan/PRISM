import React, { useState, useEffect } from "react";

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
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

      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }

      const data = await response.json();
      console.log("Fetched sections:", data);
      const formattedSections = (data.sections || []).map((section) => ({
        id: section._id,
        sectionName: section.sectionName,

        courseCode: section.courseCode?.courseCode || "N/A",

        semester: section.semester || "N/A",
        year: section.year || "N/A",

        instructor: section.instructor?.name || "Unassigned",
        instructorID: section.instructor?.instructorID || "",

        status: "Active",
        action: "Edit"
      }));

      setSections(formattedSections);
      setError(null);
    } catch (err) {
      console.error("Error fetching sections:", err);
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
      setShowModal(false);
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
      console.error("Error adding section:", err);
      setError(err.message || "Failed to add section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/deleteSection?sectionId=${sectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete section");
      }

      setSuccess("Section deleted successfully!");
      fetchSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting section:", err);
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
      {/* Success/Error Messages */}
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
            onClick={() => setShowModal(true)}
            className="bg-blue-700 w-full sm:w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900"
          >
            + Add Section
          </button>
        </div>
      </div>

      {/* Sections Table */}
      <div className="overflow-x-auto border-2 border-gray-600 rounded-md">
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
                  className="border-b border-gray-600 hover:bg-zinc-700"
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
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold"
                    >
                      Delete
                    </button>
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

      {/* Add Section Modal */}
      {showModal && (
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
                <input
                  type="text"
                  required
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                  placeholder="e.g., 1"
                />
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
                  onClick={() => setShowModal(false)}
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
