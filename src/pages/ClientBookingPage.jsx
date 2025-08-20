import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout/';
import { FaSpinner, FaTrash } from 'react-icons/fa';
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

  const handleViewReciept = (recieptId) => {
    navigate(`/dashboard/bookings/${recieptId}`);
  };

  // Function to format amount to Naira with commas
  const formatToNaira = (amount) => {
    if (!amount) return '₦0';
    return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await fetchBookings();
        setBookings(data);
        console.log(data)
        setFilteredBookings(data);
        setLoading(false);
      } catch (err) {
        console.log(err.message)
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
        booking.location.toLowerCase().includes(searchTerm.toLowerCase()) )
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
  }, [searchTerm, paymentFilter, deliveryFilter, bookings]);

  const handleViewInvoice = (bookingId) => {
    navigate(`/dashboard/invoice/${bookingId}`);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBookings(bookingId);
        // Refresh the bookings list after deletion
        const data = await fetchBookings();
        setBookings(data);
        setFilteredBookings(data);
      } catch (err) {
        console.error('Error deleting booking:', err);
        setError(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
            height: 'calc(100vh - 4rem)', // Adjust based on Navbar height
            width: '100%', // Ensure full width on mobile
          }}
        >

        <div className="container mx-auto px-4 py-8 overflow-y-scroll">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">All Bookings</h1>
          
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
                          <th className="py-3 px-4 text-left text-[#d9b683]">Booking Code</th>
                          <th className="py-3 px-4 text-left">Event Type</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Location</th>
                          <th className="py-3 px-4 text-left">Price Total</th>
                          <th className="py-3 px-4 text-left">Amount Paid</th>
                          <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id}  className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4" onClick={() => handleViewReciept(booking.id)}>{booking.booking_code}<div className='font-semibold'>{booking.client_name}</div></td>
                            <td className="py-3 px-4">{booking.event_type || 'N/A'}</td>
                            <td className="py-3 px-4">{formatDate(booking.wedding_date)}</td>
                            <td className="py-3 px-4">{booking.location}</td>
                            <td className="py-3 px-4 font-medium">
                              {formatToNaira(booking.total_amount)}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {formatToNaira(booking.total_payments_made)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2 items-center">
                                <button
                                  onClick={() => handleViewInvoice(booking.id)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                >
                                  View Invoice
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="text-[#d9b683] hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                                  title="Delete booking"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-lg shadow p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg" onClick={() => handleViewReciept(booking.id)}>
                                {booking.booking_code}
                              </h3>
                              <p className="text-sm text-gray-600">{booking.client_name}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="text-[#d9b683] hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
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
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p>{formatDate(booking.wedding_date)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p>{booking.location}</p>
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
                          
                          <button
                            onClick={() => handleViewInvoice(booking.id)}
                            className="w-full bg-[#d9b683] hover:bg-[#9b9388] text-white py-2 px-4 rounded text-sm mt-2"
                          >
                            View Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div></div>
      </div>
    </>
  );
};

export default ClientBookingPage;