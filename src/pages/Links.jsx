import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaLink, FaVideo, FaImage } from 'react-icons/fa';
import { fetchBookings } from '../services/Api';
import { Links } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';

const LinksPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchBookings();
        setBookings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading bookings: {error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        <p>No bookings found.</p>
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
        ></div>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#d9b683] mb-8 text-center md:text-left">Media Links</h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{booking.event_type || 'Wedding Event'}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  booking.payment_status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {booking.payment_status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-[#d9b683]" />
                  <span>{new Date(booking.wedding_date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-[#d9b683]" />
                  <span>{booking.location}</span>
                </div>

                {booking.event_description && (
                  <p className="text-gray-600">{booking.event_description}</p>
                )}

                {booking.additional_notes && (
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">{booking.additional_notes}</p>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">Media Links</h3>
                  
                  {booking.Image_link && (
                    <a 
                      href={booking.Image_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-[#d9b683] hover:text-[#c7a572] transition-colors mb-2"
                    >
                      <FaImage className="mr-2" />
                      View Images
                    </a>
                  )}

                  {booking.Video_link && (
                    <a 
                      href={booking.Video_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-[#44cf95] hover:text-[#c7a572] transition-colors text-xl font-bold"
                    >
                      <FaVideo className="mr-2" />
                      View Videos
                    </a>
                  )}

                  {!booking.Image_link && !booking.Video_link && (
                    <p className="text-sm text-gray-500">Media links will appear here when available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Booking Code:</span>
                <span className="font-medium">{booking.booking_code}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div></div></>
  );
};

export default LinksPage;