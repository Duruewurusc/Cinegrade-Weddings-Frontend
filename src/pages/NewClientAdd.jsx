import { useState } from 'react';
import { 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, 
  FaUser, FaCalendarAlt, FaHeart, FaInstagram, FaSave, FaTimes,
  FaSpinner, FaUserShield, FaUserTie, FaEllipsisH
} from 'react-icons/fa';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboardLayout';

const CreateClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    instagram_handle: '',
    spouse_name: '',
    spouse_phone: '',
    spouse_email: '',
    spouse_instagram: '',
    event_role: '',
    wedding_anniversary: null,
    trad_anniversary: null,
    password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };

      // Prepare the data to send (excluding confirm_password)
      const { confirm_password, ...clientData } = formData;

      // Make API call to create new client
      const response = await axios.post(
        'http://127.0.0.1:8000/api/users/',
        clientData,
        config
      );

      if (response.status === 201) {
        setSuccess(true);
        // Redirect to client list after 2 seconds
        setTimeout(() => {
          navigate('/dashboard/clientlist');
        }, 2000);
      }
    } catch (err) {
      // console.error('Error creating client:', err);
        console.error(err.response.data);
        console.error(formData)
      setError(err.response?.data?.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format dates for display (helper function)
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar/>
      <div className="flex h-screen bg-gray-100">
        <DashboardLayout />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-black">Create New Client</h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>Client created successfully! Redirecting...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Client Creation Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                    <FaUser /> Personal Information
                  </h3>
                  <div>
                    <label className="block text-gray-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                    <FaPhone /> Contact Information
                  </h3>
                  <div>
                    <label className="block text-gray-600 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    ></textarea>
                  </div>
                </div>

                {/* Spouse Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                    <FaHeart /> Spouse Information
                  </h3>
                  <div>
                    <label className="block text-gray-600 mb-1">Spouse Name</label>
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Spouse Phone</label>
                    <input
                      type="tel"
                      name="spouse_phone"
                      value={formData.spouse_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Spouse Email</label>
                    <input
                      type="email"
                      name="spouse_email"
                      value={formData.spouse_email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                </div>

                {/* Social & Other Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                    <FaInstagram /> Social & Other Information
                  </h3>
                  <div>
                    <label className="block text-gray-600 mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      name="instagram_handle"
                      value={formData.instagram_handle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Spouse Instagram</label>
                    <input
                      type="text"
                      name="spouse_instagram"
                      value={formData.spouse_instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Event Role</label>
                    <input
                      type="text"
                      name="event_role"
                      value={formData.event_role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Wedding Anniversary</label>
                    <input
                      type="date"
                      name="wedding_anniversary"
                      value={formData.wedding_anniversary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Traditional Anniversary</label>
                    <input
                      type="date"
                      name="trad_anniversary"
                      value={ formData.trad_anniversary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-end gap-3">
              <button 
                type="button"
                onClick={() => navigate('/dashboard/clientlist')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-[#d9b683] text-white rounded-md hover:bg-[#414141] transition flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <FaSave /> Create Client
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div></div>
    </>
  );
};

export default CreateClient;