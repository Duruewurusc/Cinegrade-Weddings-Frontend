import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiMapPin, FiDollarSign, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { FaBirthdayCake, FaGlassCheers, FaCameraRetro } from 'react-icons/fa';
import { fetchBookings } from '../services/Api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();
  
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await fetchBookings()
        setBookings(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  useEffect(() => {
    if (!bookings) return;
    
    const upcoming = bookings.filter(booking => {
      const eventDate = new Date(booking.wedding_date);
      return eventDate >= today;
    });
    
    const filtered = upcoming.filter(booking => 
      (booking.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
    
    setFilteredBookings(filtered);
  }, [bookings, searchTerm]);

  const getEventIcon = (eventType) => {
    switch(eventType) {
      case 'White Wedding':
        return <FaGlassCheers className="text-[#d9b683] text-xl" />;
      case 'Traditional Marriage':
        return <FaBirthdayCake className="text-[#d9b683] text-xl" />;
      case 'Prewedding Shoot':
        return <FaCameraRetro className="text-[#d9b683] text-xl" />;
      default:
        return <FiCalendar className="text-[#d9b683] text-xl" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center"><FiClock className="mr-1" /> Pending</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"><FiDollarSign className="mr-1" /> Part Paid</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"><FiCheckCircle className="mr-1" /> Paid</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center"><FiXCircle className="mr-1" /> Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const getDeliveryStatus = (status) => {
    switch(status) {
      case 'Up Coming':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Up Coming</span>;
      case 'In progress':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">In Progress</span>;
      case 'Ready':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Ready</span>;
      case 'Delivered':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Delivered</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <div>
              <p className="font-medium text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-[#d9b683] text-white rounded hover:bg-[#c9a673] transition"
              >
                Retry
              </button>
            </div>
          </div>
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
        <div className="flex-1 text-center md:text-left p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">Upcoming Events</h1>
            <p className="text-gray-600 text-sm md:text-base">Manage and track all upcoming bookings</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6 md:mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d9b683] focus:border-[#d9b683] text-sm md:text-base"
              placeholder="Search by client, location, or booking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">
                  {searchTerm ? 'No matching bookings found' : 'No upcoming bookings available'}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getEventIcon(booking.event_type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.event_type || 'Event'}</h3>
                        <p className="text-sm text-gray-500">#{booking.booking_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#d9b683]">   
                          ₦{parseFloat(booking.amount_due || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900">{booking.client_name || 'Unknown client'}</h4>
                    {booking.event_description && (
                      <p className="text-sm text-gray-500">{booking.event_description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-2 text-sm">
                    <FiCalendar className="mr-2 text-[#d9b683]" />
                    <span>{formatDate(booking.wedding_date)}</span>
                  </div>
                  
                  <div className="flex items-center mb-3 text-sm">
                    <FiMapPin className="mr-2 text-[#d9b683]" />
                    <span className="text-gray-500">{booking.location || 'Location not specified'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Payment</div>
                      {getStatusBadge(booking.payment_status)}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Delivery</div>
                      {getDeliveryStatus(booking.delivery_status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getEventIcon(booking.event_type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{booking.event_type || 'Event'}</div>
                            <div className="text-sm text-gray-500">#{booking.booking_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.client_name || 'Unknown client'}</div>
                        {booking.event_description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{booking.event_description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 text-[#d9b683]" />
                          <div className="text-sm text-gray-900">{formatDate(booking.wedding_date)}</div>
                        </div>
                        <div className="flex items-center mt-1">
                          <FiMapPin className="mr-2 text-[#d9b683]" />
                          <div className="text-sm text-gray-500">{booking.location || 'Location not specified'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">Payment</div>
                          {getStatusBadge(booking.payment_status)}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Delivery</div>
                          {getDeliveryStatus(booking.delivery_status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#d9b683]">
                          ₦{parseFloat(booking.amount_due || 0).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div></div>
    </>
  );
};

export default BookingManagement;