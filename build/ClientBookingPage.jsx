import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout/';

const ClientBookingPage = () => {
  const user = localStorage.getItem('user')
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Replace with your actual API endpoint
        const response = await axios.get('http://127.0.0.1:8000/api/bookings/', config);
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleViewInvoice = (bookingId) => {
    navigate(`/dashboard/invoice/${bookingId}`);
  };

  const handleEditBooking = (bookingId) => {
    navigate(`/bookings/edit/${bookingId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
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
    {/* <h1>{clientData.first_name}</h1> */}
    <Navbar/>
    <div className="flex h-screen bg-gray-100">
      
    <DashboardLayout children ={user} />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>You have no bookings yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-[#1a1a1a] text-white">
              <tr>
                <th className="py-3 px-4 text-left text-[#d9b683]">Booking Code</th>
                <th className="py-3 px-4 text-left">Event Type</th>
                <th className="py-3 px-4 text-left">Wedding Date</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Payment Status</th>
                <th className="py-3 px-4 text-left">Delivery Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{booking.booking_code}</td>
                  <td className="py-3 px-4">{booking.event_type || 'N/A'}</td>
                  <td className="py-3 px-4">{formatDate(booking.wedding_date)}</td>
                  <td className="py-3 px-4">{booking.location}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.payment_status === 'completed' ? 'bg-green-200 text-green-800' :
                      booking.payment_status === 'confirmed' ? 'bg-blue-200 text-blue-800' :
                      booking.payment_status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.delivery_status === 'Delivered' ? 'bg-green-200 text-green-800' :
                      booking.delivery_status === 'Ready' ? 'bg-blue-200 text-blue-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {booking.delivery_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewInvoice(booking.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        View Invoice
                      </button>
                      <button
                        onClick={() => handleEditBooking(booking.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div></div></>
  );
};

export default ClientBookingPage;