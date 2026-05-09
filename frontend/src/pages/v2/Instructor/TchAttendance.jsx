import React, { useState, useEffect, useRef, useCallback } from 'react'
import BASE_URL from '../../../config.js';

// ── Webcam Capture Component ──────────────────────────────────────────────────
// mode: "face" | "fingerprint"
const WebcamCapture = ({ onCapture, onCancel, mode = "face" }) => {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const [error,    setError]    = useState("");
  const [ready,    setReady]    = useState(false);
  const [captured, setCaptured] = useState(null); // base64 preview

  const isFingerprint = mode === "fingerprint";

  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => setReady(true));
        };
      }
    } catch (err) {
      if (err.name === "NotAllowedError")
        setError("Camera permission denied. Allow camera access in your browser settings and try again.");
      else if (err.name === "NotFoundError")
        setError("No camera found on this device.");
      else
        setError(`Camera error: ${err.message}`);
    }
  }, []);

  // Start camera on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => setReady(true));
          };
        }
      } catch (err) {
        if (!cancelled) {
          if (err.name === "NotAllowedError")
            setError("Camera permission denied. Allow camera access in your browser settings and try again.");
          else if (err.name === "NotFoundError")
            setError("No camera found on this device.");
          else
            setError(`Camera error: ${err.message}`);
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !ready) return;
    const canvas = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    // Stop the stream — preview now shows captured image
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, [ready]);

  const handleRetake = useCallback(async () => {
    setCaptured(null);
    setReady(false);
    setError("");
    await startStream();
  }, [startStream]);

  const handleConfirm = useCallback(() => {
    if (!captured) return;
    fetch(captured)
      .then(r => r.blob())
      .then(blob => onCapture(blob));
  }, [captured, onCapture]);

  return (
    <div className="flex flex-col gap-3 items-center">
      {/* Instruction banner for fingerprint */}
      {isFingerprint && (
        <div className="w-full bg-yellow-900/40 border border-yellow-600/50 rounded px-3 py-2 text-xs text-yellow-300 text-center">
          ☝ Fill the entire yellow box with your finger — hold it flat, close to the camera, ridges visible.
        </div>
      )}

      {/* Video / preview */}
      <div className="relative w-full rounded overflow-hidden bg-black"
           style={{ aspectRatio: "4/3", maxHeight: 280 }}>
        {/* Live video — hide when captured */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${captured ? "hidden" : ""}`}
        />
        {/* Captured still */}
        {captured && (
          <img src={captured} alt="Captured" className="w-full h-full object-cover" />
        )}
        {/* "Camera starting" overlay */}
        {!ready && !captured && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Starting camera…
          </div>
        )}
        {/* Guide overlay — oval for face, rectangle for fingerprint */}
        {ready && !captured && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isFingerprint ? (
              /* Large yellow box — finger should fill this entire area */
              <div
                className="border-4 border-yellow-400"
                style={{
                  width: "88%",
                  height: "85%",
                  borderStyle: "dashed",
                  borderRadius: 6,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                }}
              />
            ) : (
              <div
                className="border-2 border-green-400/60 rounded-full"
                style={{ width: "45%", height: "70%", borderStyle: "dashed" }}
              />
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}

      {/* Controls */}
      {!captured ? (
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-zinc-700 px-3 py-2 rounded-sm hover:bg-zinc-600 font-bold text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready || !!error}
            className="flex-1 bg-green-600 px-3 py-2 rounded-sm hover:bg-green-800 font-bold text-sm disabled:opacity-40"
          >
            📷 Capture
          </button>
        </div>
      ) : (
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleRetake}
            className="flex-1 bg-zinc-700 px-3 py-2 rounded-sm hover:bg-zinc-600 font-bold text-sm"
          >
            ↩ Retake
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-green-600 px-3 py-2 rounded-sm hover:bg-green-800 font-bold text-sm"
          >
            ✓ Use Photo
          </button>
        </div>
      )}
    </div>
  );
};

// ── Mark Attendance Modal ─────────────────────────────────────────────────────
const MarkModal = ({
  session, markRoll, setMarkRoll, markMethod, setMarkMethod,
  markMsg, markLoading, onSubmit, onClose, fmtDate,
}) => {
  const [showWebcam, setShowWebcam]   = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl,  setPreviewUrl]  = useState(null);

  const handleCaptured = (blob) => {
    setCapturedBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setShowWebcam(false);
  };

  const handleClearPhoto = () => {
    setCapturedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Expose blob to parent via a custom submit wrapper
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!capturedBlob) return; // both face and fingerprint require a capture
    onSubmit(e, capturedBlob);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-2 border-green-600 rounded-md p-6 w-full max-w-md flex flex-col gap-5"
           style={{ maxHeight: "95vh", overflowY: "auto" }}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl">Mark Attendance</h2>
            <p className="text-xs text-gray-400 mt-1">
              Session: <span className="text-gray-300">{fmtDate(session.date)}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">✕</button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          {/* Roll Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 font-semibold">Student Roll Number</label>
            <input
              type="text" placeholder="e.g. 23L-0742"
              value={markRoll} onChange={e => setMarkRoll(e.target.value)}
              required
              className="bg-zinc-800 border-2 border-gray-600 p-2 rounded-sm text-white"
            />
          </div>

          {/* Method */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 font-semibold">Method</label>
            <select
              value={markMethod}
              onChange={e => { setMarkMethod(e.target.value); handleClearPhoto(); setShowWebcam(false); }}
              className="bg-zinc-800 border-2 border-gray-600 p-2 rounded-sm text-white"
            >
              <option value="face">Face Recognition</option>
              <option value="fingerprint">Fingerprint (upload)</option>
            </select>
          </div>

          {/* ── Webcam capture section (face & fingerprint) ── */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-semibold">
              {markMethod === "fingerprint" ? "Fingerprint Capture" : "Face Photo"}
            </label>

            {!previewUrl && !showWebcam && (
              <button
                type="button"
                onClick={() => setShowWebcam(true)}
                className="bg-zinc-700 border-2 border-dashed border-gray-500 px-4 py-3
                           rounded-sm hover:border-green-500 hover:text-green-400
                           text-gray-300 text-sm font-semibold transition-colors"
              >
                {markMethod === "fingerprint" ? "☝ Open Camera (Fingerprint)" : "📷 Open Camera"}
              </button>
            )}

            {showWebcam && (
              <WebcamCapture
                mode={markMethod}
                onCapture={handleCaptured}
                onCancel={() => setShowWebcam(false)}
              />
            )}

            {previewUrl && !showWebcam && (
              <div className="flex flex-col gap-2">
                <img
                  src={previewUrl}
                  alt="Captured"
                  className={`w-full rounded object-cover border-2 ${
                    markMethod === "fingerprint" ? "border-yellow-700" : "border-green-700"
                  }`}
                  style={{ maxHeight: 200 }}
                />
                <button
                  type="button"
                  onClick={() => { handleClearPhoto(); setShowWebcam(true); }}
                  className="text-xs text-gray-400 hover:text-white underline self-end"
                >
                  Retake photo
                </button>
              </div>
            )}

            {!capturedBlob && !showWebcam && (
              <p className="text-xs text-yellow-500">
                ⚠ A {markMethod === "fingerprint" ? "fingerprint" : "face"} capture is required to mark attendance.
              </p>
            )}
          </div>

          {/* Message */}
          {markMsg && (
            <p className={`text-sm font-semibold ${markMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
              {markMsg}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button" onClick={onClose}
              className="bg-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-600 font-bold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={markLoading || !capturedBlob}
              className="bg-green-600 px-4 py-2 rounded-sm hover:bg-green-800 font-bold disabled:opacity-50"
            >
              {markLoading ? "Marking…" : "Mark Present"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const TchAttendance = ({ instructorId, token }) => {
  const [sections,        setSections]        = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loadingSections, setLoadingSections] = useState(true);

  const [sessions,        setSessions]        = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [activeSession, setActiveSession] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDate,      setCreateDate]      = useState(new Date().toISOString().split("T")[0]);
  const [createLoading,   setCreateLoading]   = useState(false);
  const [createMsg,       setCreateMsg]       = useState("");

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markSession,   setMarkSession]   = useState(null);
  const [markRoll,      setMarkRoll]      = useState("");
  const [markMethod,    setMarkMethod]    = useState("face");
  const [markLoading,   setMarkLoading]   = useState(false);
  const [markMsg,       setMarkMsg]       = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // ── Helpers ──
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—";

  const isOpen = (session) => (session?.status || "").toLowerCase() === "open";

  const presentCount = (session) =>
    (session.students || []).filter(s => s.status?.toLowerCase() === "present").length;

  const absentCount = (session) =>
    (session.students || []).filter(s => s.status?.toLowerCase() !== "present").length;

  const getCourseCode = (session) =>
    session.section?.courseCode?.courseCode || session.section?.courseCode || "—";

  const getSectionName = (session) =>
    session.section?.sectionName || "—";

  const currentSection = sections.find(s => s._id === selectedSection);

  const sectionLabel = (s) => {
    if (!s) return "—";
    const course = s.courseCode?.courseCode || s.courseCode || "?";
    return `${s.sectionName} — ${course} (${s.semester} ${s.year})`;
  };

  // ── Fetch sections ──
  useEffect(() => {
    if (!instructorId) return;
    fetch(`${BASE_URL}/getSection?id=${instructorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const raw = data.sections || [];
        setSections(raw);
        if (raw.length) setSelectedSection(raw[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoadingSections(false));
  }, [instructorId]);

  useEffect(() => {
    if (!selectedSection) return;
    setActiveSession(null);
    fetchSessions();
  }, [selectedSection]);

  const fetchSessions = () => {
    setLoadingSessions(true);
    fetch(
      `${BASE_URL}/getAttendanceRecord?sectionId=${selectedSection}&markedBy=${instructorId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => r.json())
      .then(data => {
        const raw = Array.isArray(data) ? data
          : data.attendanceSessions || data.sessions || data.attendanceRecords || [];
        setSessions(raw);
      })
      .catch(console.error)
      .finally(() => setLoadingSessions(false));
  };

  // ── Create session ──
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setCreateLoading(true); setCreateMsg("");
    try {
      const res = await fetch(`${BASE_URL}/createAttendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sectionId: selectedSection, markedBy: instructorId, date: createDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg("✓ Session created!");
        setTimeout(() => { setShowCreateModal(false); setCreateMsg(""); fetchSessions(); }, 1000);
      } else {
        setCreateMsg(`✗ ${data.message || "Failed"}`);
      }
    } catch { setCreateMsg("✗ Network error"); }
    finally  { setCreateLoading(false); }
  };

  // ── Mark attendance — now receives the captured image blob ──
  const handleMarkAttendance = async (e, capturedBlob) => {
    e.preventDefault();
    setMarkLoading(true); setMarkMsg("");
    try {
      const formData = new FormData();
      formData.append("studentRollNumber", markRoll.trim());
      formData.append("attendanceId",      markSession._id);
      formData.append("method",            markMethod);

      // Attach captured blob — required for both face and fingerprint
      if (capturedBlob) {
        const filename = markMethod === "fingerprint" ? "fingerprint.jpg" : "capture.jpg";
        formData.append("faceImage", capturedBlob, filename);
      }

      const res = await fetch(`${BASE_URL}/markAttendance`, {
        method: "POST",
        // Do NOT set Content-Type manually — browser sets multipart boundary automatically
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMarkMsg("✓ Marked successfully!");
        setMarkRoll("");
        fetchSessions();
      } else {
        setMarkMsg(`✗ ${data.message || "Failed"}`);
      }
    } catch { setMarkMsg("✗ Network error"); }
    finally  { setMarkLoading(false); }
  };

  // ── Delete session ──
  const handleDeleteSession = async (session, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete session for ${fmtDate(session.date)}? This cannot be undone.`)) return;
    setDeletingId(session._id);
    try {
      const res = await fetch(
        `${BASE_URL}/deleteAttendanceRecord?attendanceId=${session._id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setSessions(prev => prev.filter(s => s._id !== session._id));
        if (activeSession?._id === session._id) setActiveSession(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete session.");
      }
    } catch { alert("Network error. Could not delete session."); }
    finally  { setDeletingId(null); }
  };

  // ════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ════════════════════════════════════════════════════════════════
  if (activeSession) {
    const students = activeSession.students || [];
    const open     = isOpen(activeSession);

    return (
      <div className="flex flex-col items-start w-full">
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center m-3 p-3 gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveSession(null)}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              ← Back
            </button>
            <div>
              <h1 className="font-bold text-lg md:text-2xl">
                {getSectionName(activeSession)} — {fmtDate(activeSession.date)}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {getCourseCode(activeSession)}
                &nbsp;·&nbsp;
                {fmtTime(activeSession.startTime)} – {fmtTime(activeSession.endTime)}
                &nbsp;·&nbsp;
                <span className={`font-semibold ${open ? "text-green-400" : "text-gray-400"}`}>
                  {activeSession.status}
                </span>
              </p>
            </div>
          </div>

          {open && (
            <button
              onClick={() => { setMarkSession(activeSession); setMarkRoll(""); setMarkMsg(""); setShowMarkModal(true); }}
              className="bg-green-600 px-4 py-2 rounded-sm font-bold hover:bg-green-800 text-sm"
            >
              + Mark Attendance
            </button>
          )}
        </div>

        <div className="flex gap-3 mx-6 mb-4">
          <span className="bg-green-900/50 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
            Present: {presentCount(activeSession)}
          </span>
          <span className="bg-red-900/50 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">
            Absent: {absentCount(activeSession)}
          </span>
          <span className="bg-zinc-700 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
            Total: {students.length}
          </span>
        </div>

        <div className="flex flex-col mx-3 md:mx-5 mb-5 w-full">
          {students.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No students recorded for this session yet.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300 border-collapse">
                <thead>
                  <tr className="bg-zinc-700 text-gray-400 uppercase text-xs">
                    {["Name", "Roll Number", "Status", "Confidence Score"].map(col => (
                      <th key={col} className="px-4 py-3 border-b border-gray-600">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((rec, i) => {
                    const name    = rec.student?.name       || "—";
                    const roll    = rec.student?.rollNumber || "—";
                    const status  = rec.status              || "—";
                    const conf    = rec.confidenceScore;
                    const confStr = conf != null ? `${Number(conf).toFixed(1)}%` : "—";
                    const present = status.toLowerCase() === "present";

                    return (
                      <tr key={rec._id || i} className="border-b border-gray-700 hover:bg-zinc-700/50">
                        <td className="px-4 py-3 font-medium">{name}</td>
                        <td className="px-4 py-3 font-mono text-gray-300">{roll}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            present ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{confStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showMarkModal && markSession && (
          <MarkModal
            session={markSession}
            markRoll={markRoll}     setMarkRoll={setMarkRoll}
            markMethod={markMethod} setMarkMethod={setMarkMethod}
            markMsg={markMsg}       markLoading={markLoading}
            onSubmit={handleMarkAttendance}
            onClose={() => setShowMarkModal(false)}
            fmtDate={fmtDate}
          />
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SESSION LIST VIEW
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col items-start w-full">
      <div className="header w-full flex flex-col sm:flex-row justify-between m-3 p-3 gap-3">
        <h1 className="font-bold text-lg md:text-2xl">Attendance Sessions</h1>
        <button
          onClick={() => { setShowCreateModal(true); setCreateMsg(""); }}
          className="bg-blue-600 px-4 py-2 rounded-sm font-bold hover:bg-blue-800 text-sm"
        >
          + Create Session
        </button>
      </div>

      <div className="mx-3 px-3 mb-4">
        <label className="text-xs text-gray-400 font-semibold block mb-1">Section</label>
        {loadingSections ? (
          <p className="text-gray-500 text-sm italic">Loading…</p>
        ) : (
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="bg-zinc-900 border-2 border-gray-600 text-white p-2 rounded-sm text-sm min-w-60"
          >
            {sections.map(s => (
              <option key={s._id} value={s._id}>{sectionLabel(s)}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-3 mx-3 md:mx-5 mb-5 w-full pr-6">
        {loadingSessions ? (
          <p className="text-gray-400 italic text-sm">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-400 italic text-sm">No sessions yet. Create one to get started.</p>
        ) : (
          sessions.map((session) => {
            const open    = isOpen(session);
            const present = presentCount(session);
            const absent  = absentCount(session);

            return (
              <div
                key={session._id}
                onClick={() => setActiveSession(session)}
                className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center
                           p-4 bg-zinc-900 rounded-md border-2 border-gray-600 gap-3
                           hover:border-blue-500 cursor-pointer transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base md:text-lg">{fmtDate(session.date)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      open ? "bg-green-700 text-green-100" : "bg-zinc-600 text-gray-300"
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {getCourseCode(session)} &nbsp;·&nbsp; {getSectionName(session)}
                  </p>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span className="text-green-400 font-semibold">Present: {present}</span>
                    <span className="text-red-400   font-semibold">Absent: {absent}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                  {open && (
                    <button
                      onClick={() => { setMarkSession(session); setMarkRoll(""); setMarkMsg(""); setShowMarkModal(true); }}
                      className="bg-green-600 px-4 py-2 rounded-sm font-bold hover:bg-green-800 text-sm whitespace-nowrap"
                    >
                      Mark Attendance
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSession(session)}
                    className="bg-zinc-700 px-4 py-2 rounded-sm font-bold hover:bg-zinc-600 text-sm whitespace-nowrap"
                  >
                    View Details →
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(session, e)}
                    disabled={deletingId === session._id}
                    className="bg-red-700 px-4 py-2 rounded-sm font-bold hover:bg-red-900 text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {deletingId === session._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border-2 border-blue-600 rounded-md p-6 w-full max-w-md flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl">Create Attendance Session</h2>
                <p className="text-xs text-gray-400 mt-1">{sectionLabel(currentSection)}</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none">✕</button>
            </div>
            <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 font-semibold">Session Date</label>
                <input
                  type="date" value={createDate}
                  onChange={e => setCreateDate(e.target.value)}
                  required
                  className="bg-zinc-800 border-2 border-gray-600 p-2 rounded-sm text-white"
                />
              </div>
              {createMsg && (
                <p className={`text-sm font-semibold ${createMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                  {createMsg}
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="bg-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-600 font-bold">Cancel</button>
                <button type="submit" disabled={createLoading}
                  className="bg-blue-600 px-4 py-2 rounded-sm hover:bg-blue-800 font-bold disabled:opacity-50">
                  {createLoading ? "Creating…" : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showMarkModal && markSession && (
        <MarkModal
          session={markSession}
          markRoll={markRoll}     setMarkRoll={setMarkRoll}
          markMethod={markMethod} setMarkMethod={setMarkMethod}
          markMsg={markMsg}       markLoading={markLoading}
          onSubmit={handleMarkAttendance}
          onClose={() => setShowMarkModal(false)}
          fmtDate={fmtDate}
        />
      )}
    </div>
  );
};

export default TchAttendance;