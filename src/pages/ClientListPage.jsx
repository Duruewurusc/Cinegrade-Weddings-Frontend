import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { fetchClientList } from '../services/Api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';
import { useNavigate } from 'react-router-dom';
import { deleteClientList } from '../services/Api';

const ClientsList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await fetchClientList();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    `${client.first_name}${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.event_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setIsDeleting(id);
      try {
        await deleteClientList(id);
        setClients(clients.filter(client => client.id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleCreateClient = () => {
    navigate('/dashboard/clientlist/new');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRandomPastelColor = (str) => {
    const colors = [
      'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600',
      'bg-gradient-to-r from-green-100 to-green-50 text-green-600',
      'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-600',
      'bg-gradient-to-r from-pink-100 to-pink-50 text-pink-600',
      'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600',
      'bg-gradient-to-r from-teal-100 to-teal-50 text-teal-600'
    ];
    const index = str ? str.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#d9b683] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="fixed h-screen">
          <DashboardLayout />
        </div>

        {/* Scrollable Main Content */}
        <div 
          className="flex-1 md:ml-64 p-4 md:p-6 overflow-y-auto"
          style={{ 
            height: 'calc(100vh - 4rem)',
            width: '100%',
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Client Records</h1>
                  <p className="text-gray-600">Manage your client information and details</p>
                </div>
                <button
                  onClick={handleCreateClient}
                  className="flex items-center gap-3 bg-gradient-to-r from-[#d9b683] to-[#c9a673] hover:from-[#c9a673] hover:to-[#b99663] text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full lg:w-auto justify-center font-medium"
                >
                  <FiPlus className="h-5 w-5" />
                  Add New Client
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Search</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredClients.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <FiSearch className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <FiCalendar className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Search Bar */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search clients by name, phone, email, or role..."
                    className="block w-full pl-12 pr-4 py-3 border-0 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[#d9b683] focus:border-transparent transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                {filteredClients.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredClients.map((client) => (
                      <div 
                        key={client.id} 
                        className="p-5 hover:bg-gray-50 transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(`/dashboard/clientlist/${client.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${getRandomPastelColor(client.first_name)}`}>
                              <span className="font-bold text-lg">
                                {getInitials(client.first_name, client.last_name)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#d9b683] transition-colors">
                                {client.first_name} {client.last_name}
                              </h3>
                              {client.client_name && (
                                <p className="text-sm text-gray-600 mt-1">{client.client_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/clientlist/${client.id}/edit`);
                              }}
                              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-300"
                              title="Edit"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client.id);
                              }}
                              disabled={isDeleting === client.id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 disabled:opacity-50"
                              title="Delete"
                            >
                              {isDeleting === client.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                              ) : (
                                <FiTrash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 ml-16">
                          {client.instagram_handle && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaInstagram className="h-3.5 w-3.5 mr-2 text-pink-500" />
                              @{client.instagram_handle}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <FiPhone className="h-3.5 w-3.5 mr-2 text-blue-500" />
                            {client.phone || 'Not provided'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMail className="h-3.5 w-3.5 mr-2 text-green-500" />
                            {client.email || 'Not provided'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="h-3.5 w-3.5 mr-2 text-amber-500" />
                            {client.wedding_anniversary ? 
                              new Date(client.wedding_anniversary).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <FiSearch className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      {searchTerm ? 'No clients match your search' : 'No clients found'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-2xl">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Anniversary
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-2xl">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-gray-100">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <tr 
                            key={client.id} 
                            className="hover:bg-gray-50 transition-all duration-300 group cursor-pointer"
                            onClick={() => navigate(`/dashboard/clientlist/${client.id}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-4">
                                <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${getRandomPastelColor(client.first_name)}`}>
                                  <span className="font-bold text-lg">
                                    {getInitials(client.first_name, client.last_name)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-gray-900 group-hover:text-[#d9b683] transition-colors">
                                    {client.first_name} {client.last_name}
                                  </div>
                                  {client.client_name && (
                                    <div className="text-sm text-gray-600 mt-1">{client.client_name}</div>
                                  )}
                                  {client.instagram_handle && (
                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                      <FaInstagram className="h-3.5 w-3.5 mr-1 text-pink-500" />
                                      @{client.instagram_handle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-900">
                                  <FiPhone className="h-4 w-4 mr-2 text-blue-500" />
                                  {client.phone || 'Not provided'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <FiMail className="h-4 w-4 mr-2 text-green-500" />
                                  {client.email || 'Not provided'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <FiCalendar className="h-4 w-4 mr-2 text-amber-500" />
                                {client.wedding_anniversary ? 
                                  new Date(client.wedding_anniversary).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/dashboard/clientlist/${client.id}/edit`);
                                  }}
                                  className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-300"
                                  title="Edit"
                                >
                                  <FiEdit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClient(client.id);
                                  }}
                                  disabled={isDeleting === client.id}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 disabled:opacity-50"
                                  title="Delete"
                                >
                                  {isDeleting === client.id ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                                  ) : (
                                    <FiTrash2 className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <div className="text-gray-400 mb-4">
                              <FiSearch className="h-16 w-16 mx-auto" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">
                              {searchTerm ? 'No clients match your search' : 'No clients found'}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientsList;