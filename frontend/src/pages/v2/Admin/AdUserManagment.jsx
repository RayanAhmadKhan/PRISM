import React, { useState, useEffect } from "react";
import BASE_URL from '../../config';


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      const response = await fetch(`${BASE_URL}/getAllUsers`, {
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

  const openAddModal = () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      type: "student",
      rollNumber: "",
      adminID: "",
      instructorID: ""
    });
    setShowAddModal(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) form.append(key, formData[key]);
      });

      const res = await fetch(`${BASE_URL}/addUser`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const data = await res.json();

      // ✅ Close modal regardless of success or failure
      setShowAddModal(false);

      if (!data.success) {
        throw new Error(data.message || "Failed to add user");
      }

      setSuccess("User added successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        type: "student",
        rollNumber: "",
        adminID: "",
        instructorID: ""
      });

      fetchUsers();

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      // ❌ Show error but modal already closed
      setError(err.message || "User creation failed");

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    setError(null);
    setSuccess(null);
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email, password: "" });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      const body = {
        type: editingUser.role,
        userID: editingUser.roleId,
        ...(editFormData.name.trim() && { name: editFormData.name.trim() }),
        ...(editFormData.email.trim() && { email: editFormData.email.trim() }),
        ...(editFormData.password.trim() && { password: editFormData.password.trim() })
      };

      const res = await fetch(`${BASE_URL}/updateUserInfo`, {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/deleteUser?type=${type}&id=${id}`, {
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
        <h1 className="font-bold text-lg md:text-xl text-white">User Management</h1>
        <div className="side-btns flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="bg-zinc-900 p-2 w-full sm:w-47 font-bold rounded-sm border-2 border-gray-600 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={openAddModal}
            className="bg-blue-700 w-full sm:w-35 h-10 font-bold rounded-sm cursor-pointer hover:bg-blue-900 text-white"
          >
            + Add New User
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border-2 border-blue-600/50 shadow-2xl bg-zinc-900/30 backdrop-blur">
        <table className="w-full bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900">
          <thead>
            <tr className="border-b-2 border-blue-600/50 bg-linear-to-r from-blue-950 via-blue-900 to-blue-950">
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr key={idx} className="border-b border-gray-700/50 hover:bg-zinc-700/50 transition duration-200">
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">{user.roleId}</td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">{user.email}</td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">
                    <span className="bg-green-900 px-2 py-1 rounded text-white">{user.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-200 text-sm font-medium">
                    {user.role !== "admin" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm font-bold text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.role, user.roleId)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold text-white"
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
                <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-zinc-900 border-2 border-gray-600 rounded-lg p-5 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-5 text-white">Add New User</h2>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">User Type</label>
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
                <label className="block text-sm font-semibold mb-2 text-gray-200">Full Name</label>
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
                <label className="block text-sm font-semibold mb-2 text-gray-200">Email</label>
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
                <label className="block text-sm font-semibold mb-2 text-gray-200">Password</label>
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
                    <label className="block text-sm font-semibold mb-2 text-gray-200">Roll Number</label>
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
                    <label className="block text-sm font-semibold mb-2 text-gray-200">Face Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, face: e.target.files[0] })}
                      className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-blue-700 file:text-white file:rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-200">Fingerprint Image</label>
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
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Admin ID</label>
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
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Instructor ID</label>
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
                  disabled={isSubmitting}
                  className={`flex-1 p-2 rounded font-bold text-white ${
                    isSubmitting
                      ? "bg-blue-900 cursor-not-allowed"
                      : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  {isSubmitting ? "Adding User..." : "Add User"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 p-2 rounded font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-zinc-900 border-2 border-yellow-600 rounded-lg p-5 md:p-8 w-full max-w-md">
            <h2 className="text-xl md:text-2xl font-bold mb-1 text-white">Edit User</h2>
            <p className="text-gray-400 text-sm mb-5">
              Editing:{" "}
              <span className="text-yellow-400 font-semibold">{editingUser.name}</span>
              {" "}·{" "}
              <span className="capitalize text-gray-300">{editingUser.role}</span>
              {" "}·{" "}
              <span className="text-gray-300">{editingUser.roleId}</span>
            </p>

            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Role</label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.role}
                    className="w-full bg-zinc-700 p-2 border-2 border-gray-600 rounded text-gray-400 cursor-not-allowed capitalize"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2 text-gray-200">
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
                <label className="block text-sm font-semibold mb-2 text-gray-200">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full bg-zinc-800 p-2 border-2 border-gray-600 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">New Password</label>
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
                  disabled={isSubmitting}
                  className={`flex-1 p-2 rounded font-bold text-white ${
                    isSubmitting
                      ? "bg-yellow-700 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update User"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 p-2 rounded font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
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