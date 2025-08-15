import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await fetchClientList();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    `${client.first_name}${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.event_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  const handleDeleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClientList(id)
        setClients(clients.filter(client => client.id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleCreateClient = () => {
    navigate('/dashboard/clientlist/new');
  };

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

        <div className="flex-1  p-4 md:p-8">
          <div className="max-w-7xl mx-auto ">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left  ">Client Records</h1>
              <button
                onClick={handleCreateClient}
                className="flex items-center gap-2 bg-[#d9b683] hover:bg-[#c9a673] text-white px-4 py-2 rounded-lg transition-colors shadow-md w-full md:w-auto justify-center"
              >
                <FiPlus className="h-5 w-5" />
                Add New Client
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#d9b683] focus:border-[#d9b683]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                {filteredClients.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <div 
                        key={client.id} 
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/dashboard/clientlist/${client.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#f0e6d2] flex items-center justify-center mr-3">
                              <span className="text-[#b59a6a] font-medium">
                                {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{client.first_name} {client.last_name}</h3>
                              {client.client_name && <p className="text-sm text-gray-500">{client.client_name}</p>}
                              {client.instagram_handle && (
                                <p className="text-sm text-gray-500 flex items-center">
                                  <FaInstagram className="h-4 w-4 mr-1 text-pink-500" />
                                  @{client.instagram_handle}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/clientlist/${client.id}/edit`);
                              }}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="Edit"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client.id);
                              }}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 pl-13">
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Phone:</span> {client.phone || 'Not provided'}
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Email:</span> {client.email || 'Not provided'}
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Anniversary:</span> {client.wedding_anniversary ? 
                              new Date(client.wedding_anniversary).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No clients match your search' : 'No clients found'}
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Anniversary
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/clientlist/${client.id}`)}>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#f0e6d2] flex items-center justify-center">
                                <span className="text-[#b59a6a] font-medium">
                                  {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{client.client_name}</div>
                                {client.instagram_handle && (
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <FaInstagram className="h-4 w-4 mr-1 text-pink-500" />
                                    @{client.instagram_handle}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/clientlist/${client.id}`)}>
                            <span className='inline-flex text-lg leading-5 font-semibold'>
                              {client.first_name} {client.last_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/clientlist/${client.id}`)}>
                            <div className="text-sm text-gray-900">{client.phone || 'Not provided'}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/clientlist/${client.id}`)}>
                            <div className="text-sm text-gray-900">
                              {client.wedding_anniversary ? 
                                new Date(client.wedding_anniversary).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => navigate(`/dashboard/clientlist/${client.id}/edit`)}
                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50"
                                title="Edit"
                              >
                                <FiEdit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClient(client.id);
                                }}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                title="Delete"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          {searchTerm ? 'No clients match your search' : 'No clients found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div></div>
    </>
  );
};

export default ClientsList;