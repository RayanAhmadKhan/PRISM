import React, { useState, useEffect } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "student",
    rollNumber: "",
    adminID: "",
    instructorID: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/getAllUsers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      const formattedUsers = [];

      if (data.students) {
        data.students.forEach((user) => {
          formattedUsers.push({
            id: user._id,
            roleId: user.rollNumber,
            name: user.name,
            role: "student",
            email: user.email,
            status: "Active"
          });
        });
      }
      if (data.instructors) {
        data.instructors.forEach((user) => {
          formattedUsers.push({
            id: user._id,
            roleId: user.instructorID,
            name: user.name,
            role: "instructor",
            email: user.email,
            status: "Active"
          });
        });
      }
      if (data.admins) {
        data.admins.forEach((user) => {
          formattedUsers.push({
            id: user._id,
            roleId: user.adminID,
            name: user.name,
            role: "admin",
            email: user.email,
            status: "Active"
          });
        });
      }

      setUsers(formattedUsers);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) form.append(key, formData[key]);
      });

      const res = await fetch("http://localhost:5000/addUser", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("User added successfully!");
      setShowAddModal(false);
      setFormData({ name: "", email: "", password: "", type: "student", rollNumber: "", adminID: "", instructorID: "" });
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Opens edit modal and pre-fills with existing user data
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email, password: "" });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Only send fields that are filled in
      const body = {
        type: editingUser.role,
        userID: editingUser.roleId,
        ...(editFormData.name.trim() && { name: editFormData.name.trim() }),
        ...(editFormData.email.trim() && { email: editFormData.email.trim() }),
        ...(editFormData.password.trim() && { password: editFormData.password.trim() })
      };

      const res = await fetch("http://localhost:5000/updateUserInfo", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");

      setSuccess("User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/deleteUser?type=${type}&id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setSuccess("User deleted successfully!");
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="p-3 md:p-5">
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roleId.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="font-bold text-lg md:text-xl">User Management</h1>
        <div className="side-btns flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="bg-zinc-900 p-2 w-full sm:w-47 font-bold rounded-sm border-2 border-gray-600 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-700 w-full sm:w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900"
          >
            + Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border-2 border-gray-600 rounded-md">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-zinc-900 border-b-2 border-gray-600">
            <tr>
              <th className="p-3 text-left font-bold">Name</th>
              <th className="p-3 text-left font-bold">ID</th>
              <th className="p-3 text-left font-bold">Email</th>
              <th className="p-3 text-left font-bold">Role</th>
              <th className="p-3 text-left font-bold">Status</th>
              <th className="p-3 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr key={idx} className="border-b border-gray-600 hover:bg-zinc-700">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.roleId}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3">
                    <span className="bg-green-900 px-2 py-1 rounded">{user.status}</span>
                  </td>
                  <td className="p-3">
                    {user.role !== "admin" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.role, user.roleId)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-5 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-5">Add New User</h2>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">User Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                  placeholder="Enter password"
                />
              </div>

              {formData.type === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                      placeholder="Enter roll number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Face Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, face: e.target.files[0] })}
                      className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-blue-700 file:text-white file:rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fingerprint Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, fingerprint: e.target.files[0] })}
                      className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-blue-700 file:text-white file:rounded"
                    />
                  </div>
                </>
              )}

              {formData.type === "admin" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Admin ID</label>
                  <input
                    type="text"
                    required
                    value={formData.adminID}
                    onChange={(e) => setFormData({ ...formData, adminID: e.target.value })}
                    className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                    placeholder="Enter admin ID"
                  />
                </div>
              )}

              {formData.type === "instructor" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Instructor ID</label>
                  <input
                    type="text"
                    required
                    value={formData.instructorID}
                    onChange={(e) => setFormData({ ...formData, instructorID: e.target.value })}
                    className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white"
                    placeholder="Enter instructor ID"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 hover:bg-blue-800 p-2 rounded font-bold"
                >
                  Add User
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

      {/* ── Edit User Modal ── */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-zinc-900 border-2 border-yellow-600 rounded-lg p-5 md:p-8 w-full max-w-md">
            <h2 className="text-xl md:text-2xl font-bold mb-1">Edit User</h2>
            <p className="text-gray-400 text-sm mb-5">
              Editing:{" "}
              <span className="text-yellow-400 font-semibold">{editingUser.name}</span>
              {" "}·{" "}
              <span className="capitalize text-gray-300">{editingUser.role}</span>
              {" "}·{" "}
              <span className="text-gray-300">{editingUser.roleId}</span>
            </p>

            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              {/* Role & ID — read-only */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Role</label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.role}
                    className="w-full bg-zinc-700 p-2 border-2 border-gray-600 rounded text-gray-400 cursor-not-allowed capitalize"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">
                    {editingUser.role === "student" ? "Roll Number" : "Instructor ID"}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.roleId}
                    className="w-full bg-zinc-700 p-2 border-2 border-gray-600 rounded text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 p-2 rounded font-bold"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingUser(null); }}
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

export default UserManagement;
