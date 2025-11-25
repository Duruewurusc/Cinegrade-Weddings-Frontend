import { useState, useEffect } from 'react';
import {
  FiSearch, FiCalendar, FiMapPin, FiDollarSign, FiCheckCircle,
  FiClock, FiXCircle, FiAlertCircle, FiUser
} from 'react-icons/fi';
import { FaBirthdayCake, FaGlassCheers, FaCameraRetro } from 'react-icons/fa';
import { fetchBookings } from '../services/Api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';
import { useNavigate } from 'react-router-dom';


const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();
  const navigate = useNavigate();



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchBookings();

        const allEvents = response.flatMap((booking) => {
          const dates = booking.event_dates?.length
            ? booking.event_dates
            : [{ id: booking.id, date: booking.wedding_date }];
          return dates.map((ed) => ({
            booking_id: booking.id,
            event_type: booking.event_type,
            booking_code: booking.booking_code,
            client_name: booking.client_name,
            location: ed.date_location || booking.location,
            payment_status: booking.payment_status,
            delivery_status: booking.delivery_status,
            event_description: booking.event_description,
            date: ed.date,
          }));
        });

        const upcomingEvents = allEvents.filter(ev => new Date(ev.date) >= today);
        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAllEvents(allEvents);  
        setEvents(upcomingEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = events.filter(
      (ev) =>
        ev.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'White Wedding':
        return <FaGlassCheers className="text-[#d9b683] text-lg md:text-xl" />;
      case 'Traditional Marriage':
        return <FaBirthdayCake className="text-[#d9b683] text-lg md:text-xl" />;
      case 'Prewedding Shoot':
        return <FaCameraRetro className="text-[#d9b683] text-lg md:text-xl" />;
      default:
        return <FiCalendar className="text-[#d9b683] text-lg md:text-xl" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs flex items-center justify-center md:justify-start";
    switch (status) {
      case 'pending':
        return <span className={`bg-yellow-100 text-yellow-800 ${baseClasses}`}><FiClock className="mr-1" /> Pending</span>;
      case 'confirmed':
        return <span className={`bg-blue-100 text-blue-800 ${baseClasses}`}><FiDollarSign className="mr-1" /> Part Paid</span>;
      case 'completed':
        return <span className={`bg-green-100 text-green-800 ${baseClasses}`}><FiCheckCircle className="mr-1" /> Paid</span>;
      case 'cancelled':
        return <span className={`bg-red-100 text-red-800 ${baseClasses}`}><FiXCircle className="mr-1" /> Cancelled</span>;
      default:
        return <span className={`bg-gray-100 text-gray-800 ${baseClasses}`}>{status}</span>;
    }
  };

  const getDeliveryStatus = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs text-center md:text-left";
    switch (status) {
      case 'Up Coming':
        return <span className={`bg-purple-100 text-purple-800 ${baseClasses}`}>Up Coming</span>;
      case 'In progress':
        return <span className={`bg-blue-100 text-blue-800 ${baseClasses}`}>In Progress</span>;
      case 'Ready':
        return <span className={`bg-yellow-100 text-yellow-800 ${baseClasses}`}>Ready</span>;
      case 'Delivered':
        return <span className={`bg-green-100 text-green-800 ${baseClasses}`}>Delivered</span>;
      default:
        return <span className={`bg-gray-100 text-gray-800 ${baseClasses}`}>{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
        </div>
      </>
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
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        <div className="fixed h-screen">
          <DashboardLayout />
        </div>

        <div className="flex-1 md:ml-64 p-3 sm:p-4 lg:p-6 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Analytics Summary Cards */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
  {/* Total Bookings */}
  <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between border-l-4 border-[#d9b683]">
    <div>
      <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
      <p className="text-2xl font-bold text-gray-800">{allEvents.length}</p>
    </div>
    <FiCalendar className="text-[#d9b683] text-3xl" />
  </div>

  {/* Upcoming Events */}
  <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between border-l-4 border-green-500">
    <div>
      <h3 className="text-sm font-medium text-gray-500">Upcoming Events</h3>
      <p className="text-2xl font-bold text-gray-800">
        {events.filter(ev => new Date(ev.date) >= today).length}
      </p>
    </div>
    <FiClock className="text-green-500 text-3xl" />
  </div>

  {/* Events This Month */}
  <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between border-l-4 border-blue-500">
    <div>
      <h3 className="text-sm font-medium text-gray-500">This Month</h3>
      <p className="text-2xl font-bold text-gray-800">
        {
          events.filter(ev => {
            const eventDate = new Date(ev.date);
            return (
              eventDate.getMonth() === today.getMonth() &&
              eventDate.getFullYear() === today.getFullYear()
            );
          }).length
        }
      </p>
    </div>
    <FiMapPin className="text-blue-500 text-3xl" />
  </div>
</div>

            {/* Header */}
            <div className="mb-6 lg:mb-8 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 lg:mb-2">Upcoming Events</h1>
              <p className="text-gray-600 text-sm sm:text-base">Each event date listed chronologically</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6 lg:mb-8 max-w-2xl mx-auto md:mx-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d9b683] focus:border-[#d9b683] text-sm sm:text-base"
                placeholder="Search by client, location, event type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

             {/* Desktop Table - More Compact */}
            <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden ">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Location</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-gray-500 text-sm">
                          {searchTerm ? 'No matching events found' : 'No upcoming events available'}
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((ev, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                       onClick={() => navigate(`/dashboard/bookings/${ev.booking_id}`)}>
                          <td className="px-3 py-3">
                            <div className="flex items-center mb-1">
                              <FiCalendar className="mr-2 text-[#d9b683] flex-shrink-0 text-xs" />
                              <span className="font-medium text-gray-900 text-xs">{formatDate(ev.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <FiMapPin className="mr-2 text-[#d9b683] flex-shrink-0 text-xs" />
                              <span className="text-gray-500 text-xs truncate max-w-[120px]">{ev.location || 'Location not specified'}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              {getEventIcon(ev.event_type)}
                              <div className="ml-2">
                                <div className="text-xs font-medium text-gray-900">{ev.event_type}</div>
                                <div className="text-xs text-gray-500">#{ev.booking_code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-xs font-medium text-gray-900">{ev.client_name}</div>
                            {ev.event_description && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">{ev.event_description}</div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {getStatusBadge(ev.payment_status)}
                          </td>
                          <td className="px-3 py-3">
                            {getDeliveryStatus(ev.delivery_status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Tablet View */}
            <div className="hidden md:block lg:hidden space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl shadow-lg">
                  <p className="text-gray-500">
                    {searchTerm ? 'No matching events found' : 'No upcoming events available'}
                  </p>
                </div>
              ) : (
                filteredEvents.map((ev, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-md transition"
  onClick={() => navigate(`/dashboard/bookings/${ev.booking_id}`)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="mr-3">{getEventIcon(ev.event_type)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ev.event_type}</h3>
                          <p className="text-sm text-gray-500">#{ev.booking_code}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm">
                        <FiUser className="mr-2 text-[#d9b683] flex-shrink-0" />
                        <span className="font-medium text-gray-900">{ev.client_name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FiCalendar className="mr-2 text-[#d9b683] flex-shrink-0" />
                        <span>{formatDate(ev.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center mb-4 text-sm">
                      <FiMapPin className="mr-2 text-[#d9b683] flex-shrink-0" />
                      <span className="text-gray-600">{ev.location || 'Location not specified'}</span>
                    </div>

                    {ev.event_description && (
                      <div className="mb-4 text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {ev.event_description}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Payment</div>
                        {getStatusBadge(ev.payment_status)}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Delivery</div>
                        {getDeliveryStatus(ev.delivery_status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Mobile View */}
            {/* Ultra Dense Mobile View */}
<div className="md:hidden space-y-2">
  {filteredEvents.length === 0 ? (
    <div className="text-center py-6 bg-white rounded border">
      <p className="text-gray-500 text-sm">
        {searchTerm ? 'No matching events found' : 'No upcoming events available'}
      </p>
    </div>
  ) : (
    filteredEvents.map((ev, idx) => (
      <div key={idx}  className="bg-white p-3 rounded border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
  onClick={() => navigate(`/dashboard/bookings/${ev.booking_id}`)}>
        {/* Compact Header Row */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center flex-1 min-w-0">
            <div className="mr-2 flex-shrink-0">{getEventIcon(ev.event_type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{ev.event_type}</h3>
                <span className="text-xs text-gray-500 flex-shrink-0">#{ev.booking_code}</span>
              </div>
              <div className="flex items-center mt-1">
                <FiUser className="mr-1 text-[#d9b683] flex-shrink-0 text-xs" />
                <span className="font-medium text-gray-900 text-sm truncate">{ev.client_name}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-xs font-medium text-gray-900 whitespace-nowrap">{formatDate(ev.date)}</div>
          </div>
        </div>

        {/* Location - Single Line */}
        <div className="flex items-center text-xs text-gray-600 mb-2">
          <FiMapPin className="mr-1 text-[#d9b683] flex-shrink-0" />
          <span className="truncate">{ev.location || 'Location not specified'}</span>
        </div>

        {/* Event Description - Compact */}
        {ev.event_description && (
          <div className="mb-2 text-xs text-gray-600 line-clamp-2 bg-gray-50 px-2 py-1 rounded">
            {ev.event_description}
          </div>
        )}

        {/* Status Badges - Ultra Compact */}
        <div className="flex gap-1.5 pt-2 border-t border-gray-100">
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 mb-1 text-center">Payment</div>
            <div className="scale-90 origin-center">{getStatusBadge(ev.payment_status)}</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 mb-1 text-center">Delivery</div>
            <div className="scale-90 origin-center">{getDeliveryStatus(ev.delivery_status)}</div>
          </div>
        </div>
      </div>
    ))
  )}
</div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingManagement;