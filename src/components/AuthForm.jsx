import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../services/UserContext";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Import eye icons
import api from "../services/Api";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '', 
    password: '',
    confirm_password: '',
    address: '', 
    first_name: '', 
    last_name: '',  
    phone: ''
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, booking } = useUser();

  const navigate = useNavigate();

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage({ text: "", type: "" });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    setError('');

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          
          setError(result.error);
          setMessage({ text: result.error, type: "error" });
          return;
        }
        navigate(booking ? "/dashboard/new-booking" : "/dashboard/upcoming-events");
      } else {
        if (formData.password !== formData.confirm_password) {
          setMessage({ text: "Passwords do not match", type: "error" });
          return;
        }

        const res = await api.post('/auth/users/', {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          address: formData.address,
          username: formData.username,
          password: formData.password,
          phone: formData.phone
        });

        setMessage({ 
          text: "Registration successful! Please login.", 
          type: "success" 
        });
        setIsLogin(true); // Switch to login after successful registration
      }
    } catch (err) {
      const errorMsg = err.response?.data 
        ? Object.values(err.response.data).flat().join(' ') 
        : "An error occurred. Please try again.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[90vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 ">
        <div className="bg-white p-8 rounded shadow-xl  ">
          <div className="text-center">
            <h2 className="font-sans-serif text-3xl font-bold text-gray-900">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin 
                ? "Sign in to your account" 
                : "Join us to get started"}
            </p>
          </div>

          {message.text && (
            <div className={`mt-4 p-3 rounded-md ${
              message.type === "error" 
                ? "bg-red-50 text-red-700" 
                : "bg-green-50 text-green-700"
            }`}>
              {message.text}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="sr-only">First Name</label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        placeholder="First Name"
                        onChange={handleChange}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="sr-only">Last Name</label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        placeholder="Last Name"
                        onChange={handleChange}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="sr-only">Email</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      placeholder="Username"
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="sr-only">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Phone number"
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="sr-only">Address</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      placeholder="Address"
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border-b border-gray-300 placeholder-[#dbcab7] text-gray-900 focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm"
                />
              </div>

              {/* Password field with toggle */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border-b border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              {/* Confirm Password field with toggle (only for registration) */}
              {!isLogin && (
                <div className="relative">
                  <label htmlFor="confirm_password" className="sr-only">Confirm Password</label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#d9b683] focus:border-[#d9b683] focus:z-10 sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#d9b683] hover:bg-[#c9a673] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d9b683] transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : isLogin ? "Sign in" : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="font-medium text-[#d9b683] hover:text-[#b89a6a] transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
            
            
          </div>

           <div className="mt-2 text-center">
            <button
              onClick={()=>navigate('/forgot-password')}
              className="font-medium text-[#d9b683] hover:text-[#b89a6a] transition-colors"
            >
             Forgot Password?
            </button>
            
            
          </div>
        </div>
      </div>
    </div>
  );
}