import React, { useState, useEffect } from "react";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"


const StProfile = ({ studentId, token, decoded }) => {
  const [profile,      setProfile]      = useState(null);
  const [sectionCount, setSectionCount] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const [showModal,    setShowModal]    = useState(false);
  const [currentPass,  setCurrentPass]  = useState("");
  const [newPass,      setNewPass]      = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [saving,       setSaving]       = useState(false);
  const [statusMsg,    setStatusMsg]    = useState("");

  useEffect(() => {
    if (!studentId) return;
    fetch(`${BASE_URL}/getSection?id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const sections = data.sections || [];
        setSectionCount(sections.length);

        let studentInfo = null;
        for (const sec of sections) {
          const found = (sec.students || []).find(s =>
            (s._id || s) === studentId
          );
          if (found && found.name) { studentInfo = found; break; }
        }

        setProfile({
          name:       studentInfo?.name       || decoded.name        || "—",
          rollNumber: studentInfo?.rollNumber || decoded.rollNumber  || decoded.id || "—",
          email:      decoded.email           || "—",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  const closeModal = () => {
    setShowModal(false);
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    setStatusMsg("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMsg("");

    if (!currentPass.trim()) return setStatusMsg("✗ Please enter your current password.");
    if (!newPass.trim())      return setStatusMsg("✗ Please enter a new password.");
    if (newPass.length < 6)   return setStatusMsg("✗ New password must be at least 6 characters.");
    if (newPass !== confirmPass) return setStatusMsg("✗ New passwords do not match.");

    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/changePassword`, {
        method: "PATCH",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type:        "student",
          userID:      studentId,
          password:    currentPass.trim(),
          newPassword: newPass.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg("✓ Password changed successfully!");
        setCurrentPass(""); setNewPass(""); setConfirmPass("");
        setTimeout(() => { closeModal(); }, 2000);
      } else {
        setStatusMsg(`✗ ${data.message || "Failed to change password"}`);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("✗ Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 italic text-sm">Loading profile…</p>
    </div>
  );

  return (
    /* Full-page centered wrapper */
    <div className="min-h-screen flex justify-center px-2 py-5">
      <div className="flex flex-col gap-5 w-full max-w-2xl">

        {/* Header */}
        <div className="text-center">
          <h2 className="font-bold text-2xl md:text-3xl">My Profile</h2>
          <p className="text-gray-400 text-sm mt-1">Your personal information and account settings</p>
        </div>

        {/* Info Cards — read only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Full Name",         value: profile?.name       || "—", icon: "👤" },
            { label: "Roll Number",       value: profile?.rollNumber || "—", icon: "🪪" },
            { label: "Email",             value: profile?.email      || "—", icon: "✉️" },
            { label: "Sections Enrolled", value: sectionCount,               icon: "📋", accent: true }
          ].map(({ label, value, icon, accent }) => (
            <div
              key={label}
              className={`bg-zinc-900 rounded-xl border-2 p-4 flex items-center gap-4
                ${accent ? "border-blue-600" : "border-gray-600"}`}
            >
              <span className="text-2xl">{icon}</span>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                <p className={`font-bold text-base break-all ${accent ? "text-blue-400" : "text-white"}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Change Password trigger button — centered */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-95
                       px-6 py-2.5 rounded-md font-bold text-white transition-all duration-150"
          >
            🔑 Change Password
          </button>
        </div>
      </div>

      {/* ── Modal Overlay ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-zinc-900 border-2 border-gray-600 rounded-2xl w-full max-w-md shadow-2xl
                          animate-[fadeSlideIn_0.2s_ease-out]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-700">
              <div>
                <h3 className="font-bold text-lg text-gray-100">Change Password</h3>
                <p className="text-gray-400 text-xs mt-0.5">Enter your current password and choose a new one.</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-xl leading-none transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Status message inside modal */}
            {statusMsg && (
              <div className={`mx-6 mt-4 px-4 py-2 rounded-md font-bold text-sm ${
                statusMsg.startsWith("✓")
                  ? "bg-green-900 border border-green-600 text-green-200"
                  : "bg-red-900 border border-red-600 text-red-200"
              }`}>
                {statusMsg}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4 px-6 py-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Current Password</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-zinc-800 rounded-md border-2 border-gray-600 p-2.5 text-white
                             focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-zinc-800 rounded-md border-2 border-gray-600 p-2.5 text-white
                             focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full bg-zinc-800 rounded-md border-2 p-2.5 text-white outline-none transition ${
                    confirmPass && confirmPass !== newPass ? "border-red-500"   :
                    confirmPass && confirmPass === newPass ? "border-green-500" :
                    "border-gray-600 focus:border-blue-500"
                  }`}
                />
                {confirmPass && confirmPass !== newPass && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-md font-bold text-gray-300 border-2 border-gray-600
                             hover:border-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-900 disabled:cursor-not-allowed
                             px-6 py-2 rounded-md font-bold text-white transition"
                >
                  {saving ? "Saving…" : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyframe for modal entrance */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default StProfile;