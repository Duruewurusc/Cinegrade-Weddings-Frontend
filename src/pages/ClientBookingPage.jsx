import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaTrash, FaPlus, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout/';
import { fetchBookings, deleteBookings } from '../services/Api';

const ClientBookingPage = () => {
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const navigate = useNavigate();

  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    upcomingEvents: 0,
  });

  const handleViewReciept = (recieptId) => {
    navigate(`/dashboard/bookings/${recieptId}`);
  };

  // Function to format amount to Naira with commas
  const formatToNaira = (amount) => {
    if (!amount) return '₦0';
    return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Function to get display locations with dates
  const getDisplayLocations = (booking) => {
    // If there are event dates with locations, use them
    if (booking.event_dates && booking.event_dates.length > 0) {
      return booking.event_dates.map(eventDate => ({
        date: eventDate.date,
        location: eventDate.date_location || booking.location || 'No location specified'
      }));
    }
    
    // Fallback to booking location and wedding date
    return [{
      date: booking.wedding_date,
      location: booking.location || 'No location specified'
    }];
  };

  // Calculate analytics from bookings
  const calculateAnalytics = (bookingsData) => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    let totalRevenue = 0;
    let completedPayments = 0;
    let pendingPayments = 0;
    let upcomingEvents = 0;
    
    bookingsData.forEach(booking => {
      totalRevenue += parseFloat(booking.total_amount || 0);
      
      if (booking.payment_status === 'completed' || booking.payment_status === 'confirmed') {
        completedPayments++;
      } else if (booking.payment_status === 'pending') {
        pendingPayments++;
      }
      
      // Check for upcoming events within next 7 days
      const displayLocations = getDisplayLocations(booking);
      displayLocations.forEach(item => {
        if (item.date) {
          const eventDate = new Date(item.date);
          if (eventDate >= now && eventDate <= sevenDaysFromNow) {
            upcomingEvents++;
          }
        }
      });
    });
    
    setAnalytics({
      totalBookings: bookingsData.length,
      totalRevenue,
      completedPayments,
      pendingPayments,
      upcomingEvents,
    });
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await fetchBookings();
        // Sort bookings by creation date (newest first)
        const sortedBookings = [...data].sort((a, b) => {
          const dateA = new Date(a.created_at || a.updated_at || 0);
          const dateB = new Date(b.created_at || b.updated_at || 0);
          return dateB - dateA;
        });
        
        setBookings(sortedBookings);
        setFilteredBookings(sortedBookings);
        calculateAnalytics(sortedBookings);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  useEffect(() => {
    // Apply filters whenever search term or filters change
    let results = bookings;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(booking => 
        booking.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply payment status filter
    if (paymentFilter !== 'all') {
      results = results.filter(booking => booking.payment_status === paymentFilter);
    }
    
    // Apply delivery status filter
    if (deliveryFilter !== 'all') {
      results = results.filter(booking => booking.delivery_status === deliveryFilter);
    }
    
    setFilteredBookings(results);
    calculateAnalytics(results);
  }, [searchTerm, paymentFilter, deliveryFilter, bookings]);

  const handleViewInvoice = (bookingId) => {
    navigate(`/dashboard/invoice/${bookingId}`);
  };

  const handleAddPayment = (bookingId) => {
    navigate(`/dashboard/add-payment?invoice_id=${bookingId}`);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBookings(bookingId);
        // Refresh the bookings list after deletion
        const data = await fetchBookings();
        const sortedBookings = [...data].sort((a, b) => {
          const dateA = new Date(a.created_at || a.updated_at || 0);
          const dateB = new Date(b.created_at || b.updated_at || 0);
          return dateB - dateA;
        });
        setBookings(sortedBookings);
        setFilteredBookings(sortedBookings);
        calculateAnalytics(sortedBookings);
      } catch (err) {
        console.error('Error deleting booking:', err);
        setError(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPaymentFilter('all');
    setDeliveryFilter('all');
  };

  if (loading) {
    return (
      <>
       <Navbar/>
       {
        localStorage.removeItem('bookingData')}
      <div className="flex justify-center items-center h-screen">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
      </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
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
            height: 'calc(100vh - 4rem)',
            width: '100%',
          }}
        >
          <div className="container mx-auto px-4 py-8 overflow-y-scroll">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">All Bookings</h1>
              <button
                onClick={() => navigate('/dashboard/create-booking')}
                className="bg-[#d9b683] hover:bg-[#c9a673] text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-200"
              >
                <FaPlus className="w-4 h-4" />
                Create New Booking
              </button>
            </div>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.totalBookings}</p>
                  </div>
                  <FaCalendarAlt className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">{formatToNaira(analytics.totalRevenue)}</p>
                  </div>
                  <FaMoneyBillWave className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.upcomingEvents}</p>
                  </div>
                  <FaCalendarAlt className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed Payments</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.completedPayments}</p>
                  </div>
                  <FaCheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.pendingPayments}</p>
                  </div>
                  <FaClock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>
            
            {/* Search and Filter Section */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Payment Status Filter */}
                <div>
                  <label htmlFor="paymentFilter" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    id="paymentFilter"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                {/* Delivery Status Filter */}
                <div>
                  <label htmlFor="deliveryFilter" className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
                  <select
                    id="deliveryFilter"
                    value={deliveryFilter}
                    onChange={(e) => setDeliveryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Ready">Ready</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                
                {/* Reset Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition duration-200"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
            
            {bookings.length === 0 ? (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                <p>You have no bookings yet.</p>
              </div>
            ) : (
              <>
                {filteredBookings.length === 0 ? (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>No bookings match your filters.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-[#1a1a1a] text-white">
                          <tr>
                            <th className="py-3 px-4 text-left text-[#d9b683]">Booking Details</th>
                            <th className="py-3 px-4 text-left">Event Type</th>
                            <th className="py-3 px-4 text-left">Date & Location</th>
                            <th className="py-3 px-4 text-left">Price Total</th>
                            <th className="py-3 px-4 text-left">Amount Paid</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700">
                          {filteredBookings.map((booking) => {
                            const displayLocations = getDisplayLocations(booking);
                            
                            return (
                              <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4 cursor-pointer" onClick={() => handleViewReciept(booking.id)}>
                                  <div className="text-xs text-gray-500 mb-1">{booking.booking_code}</div>
                                  <div className="font-bold text-gray-800 hover:text-blue-800">{booking.client_name}</div>
                                </td>
                                <td className="py-3 px-4">{booking.event_type || 'N/A'}</td>
                                
                                <td className="py-3 px-4">
                                  <div className="flex flex-col space-y-2">
                                    {displayLocations.map((item, index) => (
                                      <div key={index} className="border-l-2 border-[#d9b683] pl-2">
                                        <div className="font-medium">{formatDate(item.date)}</div>
                                        <div className="text-sm text-gray-600">{item.location}</div>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                <td className="py-3 px-4 font-medium">
                                  {formatToNaira(booking.total_amount)}
                                </td>
                                <td className="py-3 px-4 font-medium">
                                  {formatToNaira(booking.total_payments_made)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col space-y-2">
                                    <button
                                      onClick={() => handleViewInvoice(booking.id)}
                                      className="bg-[#d9b683] hover:bg-[#c0a06f] text-white px-3 py-2 rounded text-sm"
                                    >
                                      View Invoice
                                    </button>
                                    <button
                                      onClick={() => handleAddPayment(booking.id)}
                                      className=" hover:bg-[#999999] text-[#131313] px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                                    >
                                      <FaMoneyBillWave className="w-3 h-3" />
                                      AddPayment
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBooking(booking.id)}
                                      className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1 text-sm"
                                      title="Delete booking"
                                    >
                                      <FaTrash className="w-3 h-3" />
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {filteredBookings.map((booking) => {
                        const displayLocations = getDisplayLocations(booking);
                        
                        return (
                          <div key={booking.id} className="bg-white rounded-lg shadow p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div className="cursor-pointer" onClick={() => handleViewReciept(booking.id)}>
                                  <div className="text-xs text-gray-500">{booking.booking_code}</div>
                                  <h3 className="font-bold text-lg text-gray-800">
                                    {booking.client_name}
                                  </h3>
                                </div>
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                                  title="Delete booking"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-gray-500">Event Type</p>
                                  <p>{booking.event_type || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm text-gray-500 mb-1">Date & Location</p>
                                  <div className="space-y-2">
                                    {displayLocations.map((item, index) => (
                                      <div key={index} className="border-l-2 border-[#d9b683] pl-2">
                                        <div className="font-medium">{formatDate(item.date)}</div>
                                        <div className="text-sm text-gray-600">{item.location}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Total Amount</p>
                                  <p className="font-medium">{formatToNaira(booking.total_amount)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Amount Paid</p>
                                  <p className="font-medium">{formatToNaira(booking.total_payments_made)}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2 mt-2">
                                <button
                                  onClick={() => handleViewInvoice(booking.id)}
                                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                                >
                                  View Invoice
                                </button>
                                <button
                                  onClick={() => handleAddPayment(booking.id)}
                                  className="w-full bg-green-500 hover:bg-gray- text-white py-2 px-4 rounded text-sm flex items-center justify-center gap-1"
                                >
                                  <FaMoneyBillWave className="w-3 h-3" />
                                  Add Payment
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientBookingPage;