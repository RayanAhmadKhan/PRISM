import React, { useState } from 'react'
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!id || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setError("");

      const res = await axios.post("http://localhost:5000/loginUser", {
        id,
        password
      });

      const token = res.data.token;

      // decode token
      const decoded = jwtDecode(token);

      // store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.type);

      // redirect based on role
      if (decoded.type === "admin") {
        window.location.href = "/pages/v2/AdminDash";
      } else if (decoded.type === "instructor") {
        window.location.href = "/pages/v2/TeacherDash";
      } else {
        window.location.href = "/pages/v2/StudentDash";
      }

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-950">
      <div className="bg-zinc-900 p-6 rounded-md w-80 text-white">

        <h1 className="text-center text-xl font-bold text-blue-400 mb-5">
          PRISM LOGIN
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="p-2 bg-gray-700 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 bg-gray-700 rounded"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 py-2 rounded hover:bg-blue-800"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  )
}

export default Login