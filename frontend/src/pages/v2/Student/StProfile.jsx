import React, { useState, useEffect } from "react";

const StProfile = ({ studentId, token, decoded }) => {
  const [profile,      setProfile]      = useState(null);
  const [sectionCount, setSectionCount] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const [currentPass,  setCurrentPass]  = useState("");
  const [newPass,      setNewPass]      = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [saving,       setSaving]       = useState(false);
  const [statusMsg,    setStatusMsg]    = useState("");

  useEffect(() => {
    if (!studentId) return;
    fetch(`http://localhost:5000/getSection?id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const sections = data.sections || [];
        setSectionCount(sections.length);

        // Pull student info from first section's students array if available
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMsg("");

    if (!currentPass.trim()) return setStatusMsg("✗ Please enter your current password.");
    if (!newPass.trim())      return setStatusMsg("✗ Please enter a new password.");
    if (newPass.length < 6)   return setStatusMsg("✗ New password must be at least 6 characters.");
    if (newPass !== confirmPass) return setStatusMsg("✗ New passwords do not match.");

    try {
      setSaving(true);
      console.log("Attempting to change password...", newPass.trim());
      const res = await fetch("http://localhost:5000/changePassword", {
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
        setTimeout(() => setStatusMsg(""), 3000);
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

  if (loading) return <p className="m-5 text-gray-400 italic text-sm">Loading profile…</p>;

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-xl md:text-2xl">My Profile</h2>
        {statusMsg && (
          <p className={`px-4 py-2 rounded-md font-bold text-sm ${
            statusMsg.startsWith("✓")
              ? "bg-green-900 border border-green-600 text-green-200"
              : "bg-red-900 border border-red-600 text-red-200"
          }`}>
            {statusMsg}
          </p>
        )}
      </div>

      {/* Info Cards — read only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Full Name",        value: profile?.name       || "—", icon: "👤" },
          { label: "Roll Number",      value: profile?.rollNumber || "—", icon: "🪪" },
          { label: "Email",            value: profile?.email      || "—", icon: "✉️" },
          { label: "Sections Enrolled",value: sectionCount,               icon: "📋", accent: true }
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

      {/* Change Password */}
      <div className="bg-zinc-900 rounded-xl border-2 border-gray-600 p-5">
        <h3 className="font-bold text-base mb-1 text-gray-200">Change Password</h3>
        <p className="text-gray-400 text-sm mb-5">Enter your current password and choose a new one.</p>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Current Password</label>
            <input
              type="password"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-zinc-800 rounded-md border-2 border-gray-600 p-2.5 text-white focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-zinc-800 rounded-md border-2 border-gray-600 p-2.5 text-white focus:border-blue-500 outline-none transition"
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

          <div className="flex justify-end pt-1">
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
  );
};

export default StProfile;