import React, { useState } from "react";
import api from "../services/Api"; // Adjust the import path as necessary
import Navbar from '../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/users/reset_password/", {
        email: email
      });

      // For Axios, successful responses have status 200-299
      if (response.status >= 200 && response.status < 300) {
        setMessage(" Success! Check your email for password reset instructions.");
      } else {
        setMessage(`Error: ${response.data.email || "Something went wrong."}`);
      }
    } catch (err) {
      // Axios error handling
      if (err.response) {
        // Server responded with error status (4xx, 5xx)
        setMessage(`Error: ${err.response.data.email || "Something went wrong."}`);
      } else if (err.request) {
        // Request was made but no response received
        setMessage("Network error, please try again.");
      } else {
        // Other errors
        setMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 mt-[-100px]">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "#d9b683" }}>
            Forgot Password
          </h2>

          {message && (
            <div className={`mb-4 text-center text-sm font-medium ${
              message.includes("Success!") ? "text-green-600" : "text-red-600"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 py-4">Enter your Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-sm shadow-md font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#d9b683" }}
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <a href="/login" style={{ color: "#d9b683" }} className="font-medium hover:underline">
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}