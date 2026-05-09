import React, { useState, useEffect } from "react";
import BASE_URL from '../../config';
const TchCase = ({ instructorId, token }) => {
  const [flaggedCases, setFlaggedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [searchRoll, setSearchRoll] = useState("");
  const [filterSection, setFilterSection] = useState("all");

  useEffect(() => {
    if (!instructorId) return;

    fetch(`${BASE_URL}/getFlaggedCases?markedBy=${instructorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const raw = Array.isArray(data) ? data : [];
        setFlaggedCases(raw);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [instructorId, token]);

  const handleAction = async (item, action) => {
    setActionLoading(item._id + item.studentId);
    console.log(`Performing action: ${action} on attendanceId: ${item.attendanceId}, studentId: ${item.studentId}`);

    try {
      const res = await fetch(`${BASE_URL}/flagApproval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendanceId: item.attendanceId,
          studentId: item.studentId,
          action,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFlaggedCases((prev) =>
          prev
            .map((c) => {
              if (c._id !== item.attendanceId) return c;

              return {
                ...c,
                students: c.students.filter(
                  (s) => s.student?._id !== item.studentId
                ),
              };
            })
            .filter((c) => c.students.length > 0)
        );
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  // FLATTEN DATA (NOW INCLUDES CONFIDENCE SCORE)
  let flattenedCases = flaggedCases.flatMap((item) =>
    item.students
      ?.filter((s) => s.flagged)
      .map((s) => ({
        _id: item._id,
        attendanceId: item._id,
        studentId: s.student?._id,
        name: s.student?.name,
        rollNumber: s.student?.rollNumber,
        reason: s.flagReason,
        status: item.status,
        confidenceScore: s.confidenceScore,   // ✅ ADDED HERE
        section: item.section?.sectionName || item.section || "—",
        course:
          item.section?.courseCode?.courseCode ||
          item.section?.courseCode ||
          "—",
      })) || []
  );

  // FILTERS
  flattenedCases = flattenedCases.filter((item) => {
    const matchRoll = item.rollNumber
      ?.toLowerCase()
      .includes(searchRoll.toLowerCase());

    const matchSection =
      filterSection === "all" || item.section === filterSection;

    return matchRoll && matchSection;
  });

  const uniqueSections = [
    ...new Set(
      flaggedCases.map((c) => c.section?.sectionName).filter(Boolean)
    ),
  ];

  return (
    <div className="flex flex-col gap-5 m-3 md:m-5 w-full">

      {/* HEADER */}
      <h1 className="font-bold text-lg md:text-2xl">
        Flagged Cases {!loading && `(${flattenedCases.length})`}
      </h1>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">

        <input
          type="text"
          placeholder="Search by Roll Number..."
          value={searchRoll}
          onChange={(e) => setSearchRoll(e.target.value)}
          className="p-2 bg-zinc-900 border border-gray-600 rounded text-white w-full md:w-1/3"
        />

        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="p-2 bg-zinc-900 border border-gray-600 rounded text-white"
        >
          <option value="all">All Sections</option>
          {uniqueSections.map((sec, i) => (
            <option key={i} value={sec}>
              {sec}
            </option>
          ))}
        </select>

      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-400 italic text-sm">Loading flagged cases…</p>
      ) : flattenedCases.length === 0 ? (
        <p className="text-gray-400 italic text-sm">
          No flagged cases remaining.
        </p>
      ) : (
        flattenedCases.map((item) => {
          const isBusy = actionLoading === item._id + item.studentId;

          return (
            <div
              key={item._id + item.studentId}
              className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-zinc-900 rounded-md border-2 border-gray-600 gap-3"
            >

              {/* LEFT */}
              <div className="flex flex-col gap-1">

                <h1 className="font-bold text-base md:text-xl">
                  {item.name || "Unknown"}{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    ({item.rollNumber || "—"})
                  </span>
                </h1>

                <p className="text-red-500 text-sm">
                  {item.reason || "Manual Verification Required"}
                </p>

                {/* ✅ CONFIDENCE SCORE ADDED */}
                <p className="text-yellow-400 text-sm font-semibold">
                  Confidence Score: {item.confidenceScore ?? "N/A"}%
                </p>

                <p className="text-gray-400 text-xs">
                  {item.section}
                </p>

              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 p-3 md:p-5 w-full sm:w-auto">

                <button
                  disabled={isBusy}
                  onClick={() => handleAction(item, "accept")}
                  className="bg-blue-700 w-full sm:w-24 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900 disabled:opacity-50"
                >
                  {isBusy ? "…" : "Verify"}
                </button>

                <button
                  disabled={isBusy}
                  onClick={() => handleAction(item, "reject")}
                  className="bg-red-600 w-full sm:w-24 h-10 font-bold rounded-sm cursor-pointer hover:bg-red-800 disabled:opacity-50"
                >
                  {isBusy ? "…" : "Report"}
                </button>

              </div>

            </div>
          );
        })
      )}
    </div>
  );
};

export default TchCase;