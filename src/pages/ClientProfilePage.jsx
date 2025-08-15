import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
// import NavigationPanel from './NavigationPanel'; // Your existing navigation component
import DashboardLayout from '../components/dashboardLayout/';
import Navbar from '../components/Navbar';

const ClientProfilePage = () => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log(token)

        const response = await axios.get("http://127.0.0.1:8000/auth/users/me/", config);
        // console.log(response.data)
        setClientData(response.data);
        setFormData(response.data);
        // console.log(response.data.username)
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch client data');
        console.error('Error fetching client data:', error);
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access');
      await axios.patch('/auth/users/me/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setClientData(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating client data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        
        <DashboardLayout/>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="flex h-screen bg-gray-100">
      
      <DashboardLayout children ={clientData.first_name} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Client Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-[#d9b683] text-white rounded-lg hover:opacity-90 transition duration-200"
              >
                {isEditing ? 'Cancel' : 'Update Information'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Role</label>
                    <select
                      name="event_role"
                      value={formData.event_role || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Role</option>
                      <option value="Groom">Groom</option>
                      <option value="Bride">Bride</option>
                      <option value="Relation">Relation</option>
                      <option value="Planner">Planner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      name="instagram_handle"
                      value={formData.instagram_handle || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Anniversary</label>
                    <input
                      type="date"
                      name="wedding_anniversary"
                      value={formData.wedding_anniversary || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Traditional Anniversary</label>
                    <input
                      type="date"
                      name="Trad_aniversary"
                      value={formData.Trad_aniversary || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Spouse Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                      <input
                        type="text"
                        name="spouse_name"
                        value={formData.spouse_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Phone</label>
                      <input
                        type="text"
                        name="spouse_phone"
                        value={formData.spouse_phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Email</label>
                      <input
                        type="email"
                        name="spouse_email"
                        value={formData.spouse_email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Social Media</label>
                      <input
                        type="text"
                        name="spouse_social_media"
                        value={formData.spouse_social_media || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d9b683] text-white rounded-lg hover:opacity-90 transition duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Client Name</p>
                    <p className="font-medium">{clientData.first_name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Event Role</p>
                    <p className="font-medium">{clientData.event_role || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{clientData.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Instagram Handle</p>
                    <p className="font-medium">
                      {clientData.instagram_handle ? `@${clientData.instagram_handle}` : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Wedding Anniversary</p>
                    <p className="font-medium">
                      {clientData.wedding_anniversary ? new Date(clientData.wedding_anniversary).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Traditional Anniversary</p>
                    <p className="font-medium">
                      {clientData.Trad_aniversary ? new Date(clientData.Trad_aniversary).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Spouse Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Spouse Name</p>
                      <p className="font-medium">{clientData.spouse_name || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Spouse Phone</p>
                      <p className="font-medium">{clientData.spouse_phone || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Spouse Email</p>
                      <p className="font-medium">{clientData.spouse_email || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Spouse Social Media</p>
                      <p className="font-medium">{clientData.spouse_social_media || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ClientProfilePage;