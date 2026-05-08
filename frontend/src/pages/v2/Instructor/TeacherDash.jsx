import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../../components/Navbar";
import LeftNav from "../../../components/LeftNav";
import Table from "../../../components/Table";
import TchAttendance from "./TchAttendance";
import TchCase from "./TchCase";
import TchProfile from "./TchProfile";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"


const getCurrentSemester = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 5) return "spring";
  if (month >= 6 && month <= 7) return "summer";
  return "fall";
};

const TeacherDashboard = () => {
  const token          = localStorage.getItem("token");
  const decoded        = token ? jwtDecode(token) : {};
  const instructorId   = decoded._id  || "";
  const instructorName = decoded.name || "Instructor";

  const [sections,        setSections]        = useState([]);
  const [flaggedCases,    setFlaggedCases]    = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingFlags,    setLoadingFlags]    = useState(true);
  const [activeTab,       setActiveTab]       = useState("dashboard");

  const currentYear     = new Date().getFullYear();
  const currentSemester = getCurrentSemester();

  useEffect(() => {
    if (!instructorId) return;
    fetch(`${BASE_URL}/getSection?id=${instructorId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const raw      = data.sections || [];
        const filtered = raw.filter((s) => s.semester?.toLowerCase() === currentSemester && Number(s.year) === currentYear);
        setSections(filtered.length ? filtered : raw);
      })
      .catch(console.error)
      .finally(() => setLoadingSections(false));
  }, [instructorId]);

  useEffect(() => {
    if (!instructorId) return;
    fetch(`${BASE_URL}/getFlaggedCases?markedBy=${instructorId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const raw = data.flaggedCases || data || [];
        console.log("Fetched flagged cases:", raw);
        setFlaggedCases(Array.isArray(raw) ? raw : []);
      })
      .catch(console.error)
      .finally(() => setLoadingFlags(false));
  }, [instructorId]);

  const sessionRows = sections.map((s) => ({
    course:   s.courseCode?.courseName || s.courseCode?.courseCode || "—",
    section:  s.sectionName,
    semester: `${s.semester?.charAt(0).toUpperCase()}${s.semester?.slice(1)} ${s.year}`,
    students: s.students?.length ?? 0,
  }));

  const flagRows = flaggedCases.flatMap((f) => {
  return f.students
    ?.filter((s) => s.flagged)
    .map((s) => ({
      student: s.student?.name || "—",
      id: s.student?.rollNumber || "—",
      reason: s.flagReason || "—",
      status: f.status || "Pending",
    })) || [];
});

  const renderContent = () => {
    switch (activeTab) {
      case "attendance": return <TchAttendance instructorId={instructorId} token={token} />;
      case "flagged":    return <TchCase       instructorId={instructorId} token={token} />;
      case "profile":    return <TchProfile    instructorId={instructorId} instructorName={instructorName} token={token} />;
      default:
        return (
          <>
            <div className="flex flex-col gap-5 m-3 md:m-5 overflow-x-auto">
              <h1 className="font-bold text-lg md:text-xl">Flagged Cases {!loadingFlags && `(${flaggedCases.length})`}</h1>
              {loadingFlags ? <p className="text-gray-400 italic text-sm">Loading…</p>
                : <Table columns={["Student", "ID", "Reason", "Status"]} rows={flagRows} />}
            </div>
            <div className="flex flex-col gap-5 m-3 md:m-5 overflow-x-auto">
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-lg md:text-xl">My Sections</h1>
                <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                  {currentSemester.charAt(0).toUpperCase() + currentSemester.slice(1)} {currentYear}
                </span>
              </div>
              {loadingSections ? <p className="text-gray-400 italic text-sm">Loading sections…</p>
                : <Table columns={["Course", "Section", "Semester", "Students"]} rows={sessionRows} />}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-dvh w-full">
      <Navbar title={"Teacher"} user={instructorName} />
      <div className="body bg-zinc-900 flex">
        <LeftNav
          btn1={"Teacher Dashboard"}
          btn2={"Attendance Record"}
          btn3={"Flagged Cases"}
          btn4={"Profile Settings"}
          onTabChange={setActiveTab}
        />
        <div className="container h-screen flex flex-col bg-zinc-800 w-full overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;