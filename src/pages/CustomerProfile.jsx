import { useState, useEffect } from 'react';
import { 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaPaperPlane, 
  FaUser, FaCalendarAlt, FaHeart, FaInstagram, FaSave, FaTimes,
  FaSpinner, FaUserShield, FaUserTie, FaEllipsisH
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useUser } from '../services/UserContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboardLayout';



const CustomerProfile = () => {
  // State management
  const navigate = useNavigate()
  const {user} = useUser()
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
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
    event_role: ''
  });
  const [admin, setAdmin] = useState(user?.is_superuser)

  // Fetch customer data
//   console.log('is admin?'+user?.is_superuser)
    console.log(admin)
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Replace with actual API call
        const response = await axios.get(admin?`http://127.0.0.1:8000/api/users/${id}/`:"http://127.0.0.1:8000/auth/users/me/", config);
        console.log(user)

        // if (!response.ok) {
        //   throw new Error('Failed to fetch customer data');
        // }
        // const data = await response.json();
        
        setCustomer(response.data);
        setEditForm({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          instagram_handle: response.data.instagram_handle || '',
          spouse_name: response.data.spouse_name || '',
          spouse_phone: response.data.spouse_phone || '',
          spouse_email: response.data.spouse_email || '',
          spouse_instagram: response.data.spouse_instagram || '',
          event_role: response.data.event_role || ''
        });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:',err);

      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited data
  const handleSave = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch('https://api.example.com/customers/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update customer data');
      }
      
      const updatedData = await response.json();
      setCustomer(updatedData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading && !customer) {
    return (<>
       <Navbar/>
      <div className="flex justify-center items-center h-screen">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
      </div>
      </>);
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>No customer data found</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="flex h-screen bg-gray-100">
      <div className="fixed h-screen">
          <DashboardLayout />
        </div>

    {/* Scrollable Main Content */}
        <div 
           className="flex-1 md:ml-64 p-4 overflow-y-auto"
          style={{ 
            height: 'calc(100vh - 4rem)', // Adjust based on Navbar height
            width: '100%', // Ensure full width on mobile
          }}
        >

    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between  md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-black text-center md:text-left">Customer Profile</h1>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
          <span className="font-medium">Last login:</span> {formatDateTime(customer.last_login)}
        </div>
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#d9b683] text-white rounded-md hover:bg-[#414141] transition flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

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
                    value={editForm.first_name}
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
                    value={editForm.last_name}
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
                    value={editForm.username}
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
                    value={editForm.phone}
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
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
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
                    value={editForm.spouse_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Spouse Phone</label>
                  <input
                    type="tel"
                    name="spouse_phone"
                    value={editForm.spouse_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Spouse Email</label>
                  <input
                    type="email"
                    name="spouse_email"
                    value={editForm.spouse_email}
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
                    value={editForm.instagram_handle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Spouse Instagram</label>
                  <input
                    type="text"
                    name="spouse_instagram"
                    value={editForm.spouse_instagram}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Event Role</label>
                  <input
                    type="text"
                    name="event_role"
                    value={editForm.event_role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Profile Display */
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Profile Image Section */}
            <div className="md:w-1/4 bg-gradient-to-br from-[#ffffff] to-[#e4d8c5] flex items-center justify-center p-8">
              <div className="relative text-center">
                <div className="w-32 h-32 rounded-full bg-[#d9b683] flex items-center justify-center text-[#ffffff] text-5xl font-bold mx-auto mb-4">
                  {customer.first_name?.[0]}{customer.last_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{customer.first_name} {customer.last_name}</h2>
                <p className="text-gray-600">@{customer.username}</p>
                <span className="absolute top-0 right-0 bg-green-500 rounded-full w-5 h-5 border-2 border-white"></span>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="md:w-3/4 p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {customer.is_active && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active
                      </span>
                    )}
                    {customer.is_staff && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <FaUserTie className="text-xs" /> Staff
                      </span>
                    )}
                    {customer.is_superuser && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <FaUserShield className="text-xs" /> Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Member since: {formatDate(customer.date_joined)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
                    <FaPhone className="text-[#d9b683]" /> Contact
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Phone</p>
                      <p className="font-medium flex items-center gap-2">
                        <FaPhone className="text-indigo-400" /> {customer.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="font-medium flex items-center gap-2">
                        <FaEnvelope className="text-indigo-400" /> {customer.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Address</p>
                      <p className="font-medium flex items-start gap-2">
                        <FaMapMarkerAlt className="text-indigo-400 mt-1" /> 
                        {customer.address ? (
                          <span>{customer.address.split('\n').map((line, i) => (
                            <span key={i}>{line}<br/></span>
                          ))}</span>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
                    <FaUser className="text-[#d9b683]" /> Account
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">User Role</p>
                      <p className="font-medium">
                        {customer.is_superuser ? 'Superuser' : ''}
                        {customer.is_staff ? (customer.is_superuser ? ' / Staff' : 'Staff') : ''}
                        {!customer.is_superuser && !customer.is_staff ? 'Regular User' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Event Role</p>
                      <p className="font-medium">{customer.event_role || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Last Login</p>
                      <p className="font-medium">{formatDateTime(customer.last_login)}</p>
                    </div>
                  </div>
                </div>

                {/* Spouse Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
                    <FaHeart className="text-indigo-500" /> Spouse
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Name</p>
                      <p className="font-medium flex items-center gap-2">
                        <FaUser className="text-indigo-400" /> {customer.spouse_name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Phone</p>
                      <p className="font-medium flex items-center gap-2">
                        <FaPhone className="text-indigo-400" /> {customer.spouse_phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Anniversaries</p>
                      <p className="font-medium flex items-center gap-2">
                        <FaCalendarAlt className="text-indigo-400" />
                        {customer.wedding_anniversary || customer.trad_anniversary 
                          ? `Wedding: ${formatDate(customer.wedding_anniversary)}, Traditional: ${formatDate(customer.trad_anniversary)}`
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
                    <FaInstagram className="text-[#d9b683]" /> Social
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Instagram</p>
                      <p className="font-medium flex items-center gap-2">
                        <FaInstagram className="text-indigo-400" /> 
                        {customer.instagram_handle ? `@${customer.instagram_handle}` : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Spouse Instagram</p>
                      <p className="font-medium flex items-center gap-2">
                        <FaInstagram className="text-indigo-400" /> 
                        {customer.spouse_instagram ? `@${customer.spouse_instagram}` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex flex-wrap justify-end gap-3">
            <button 
            onClick={() => navigate(admin?'/dashboard/clientlist':'/dashboard/bookings')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <FaEllipsisH /> Back to dashboard
          </button>
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <FaEdit /> Edit Profile
          </button>
          <button className="px-4 py-2 bg-[#d9b683] text-white rounded-md hover:bg-[#1d1d1d] transition flex items-center gap-2">
            <FaPaperPlane /> Send Message
          </button>
        </div>
      )}
    </div></div></div></>
  );
};

export default CustomerProfile;