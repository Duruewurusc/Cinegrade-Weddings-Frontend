import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout/';
import { FaSpinner } from 'react-icons/fa';

const ClientPaymentsViewPage = () => {
  const user = localStorage.getItem('user')

  const [booking, setBooking] = useState(null);
  const [payments, setPayment] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Replace with your actual API endpoint
        const response = await axios.get('http://127.0.0.1:8000/api/payments/', config);
        const booking_response = await axios.get('http://127.0.0.1:8000/api/bookings/', config);
        setPayment(response.data);
        setBooking(booking_response.data);
        setFilteredPayments(response.data);
        setLoading(false);
        // console.log(booking_response.data)
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    // Apply filters whenever search term or filters change
    let results = payments;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(paymentss => 
        paymentss.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paymentss.status?.toLowerCase().includes(searchTerm.toLowerCase()) 
        // paymentss.invoice.toLowerCase().includes(searchTerm.toLowerCase()) 
        );
      }
    
    
    // Apply payment status filter
    if (paymentFilter !== 'all') {
      results = results.filter(payments => payments.status === paymentFilter);
    }
    
    // Apply delivery status filter
    if (dateFilter !== 'all') {
      results = results.filter(payments => payments.payment_date === dateFilter);
    }
    
    setFilteredPayments(results);
  }, [searchTerm, paymentFilter, dateFilter, payments]);


//   const getInvoice = (iid) => {
//     // if (!booking) return [];
//     return payments.invoice.map(id => {
//       const inv = booking.find(b => b.id === id);
//       return inv ;
//     });
//   };
//   console.log(getInvoice())

  const handleViewReciept = (recieptId) => {
    navigate(`/dashboard/receipt/${recieptId}`);
  };

//   const handleEditBooking = (bookingId) => {
//     navigate(`/bookings/edit/${bookingId}`);
//   };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPaymentFilter('all');
    setDateFilter('all');
  };

  if (loading) {
    return (
      <>
       <Navbar/>
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-[#d9b683]" />
      </div>
      </>)
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-100 border text-red-700 px-4 py-3 rounded relative" role="alert">
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
          
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Payments</h1>
          
          {/* Search and Filter Section */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search Payments..."
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
              
              {/* Date Status Filter */}
              <div>
                
                
      <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
      <form className="">
            <input type="date" id="date" value={dateFilter == 'all'?'': dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
            />
      {/* <p className="text-sm text-gray-500 mt-2">Selected: {selectedDate || 'None'}</p> */}
    </form>
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
          
          {payments.length === 0 ? (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p>You have no bookings yet.</p>
            </div>
          ) : (
            <>
              {filteredPayments.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  <p>No bookings match your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-[#1a1a1a] text-white">
                      <tr>
                        <th className="py-3 px-4 text-left text-[#d9b683]">Reciept Number</th>
                        <th className="py-3 px-4 text-left">Booking</th>
                        <th className="py-3 px-4 text-left">Payment Date</th>
                        <th className="py-3 px-4 text-left">Amount Paid</th>
                        <th className="py-3 px-4 text-left">Payment Status</th>
                        <th className="py-3 px-4 text-left">Payment Method</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {filteredPayments.map((payments) => (
                        <tr key={payments.id} onClick={() => handleViewReciept(payments.id)} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">{payments.receipt_number}</td>
                          <td className="py-3 px-4">{payments.invoice.booking_code || 'N/A'}</td>
                          <td className="py-3 px-4">{formatDate(payments.payment_date)}</td>
                          <td className="py-3 px-4">{payments.amount_paid}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payments.status === 'completed' ? 'bg-green-200 text-green-800' :
                              payments.status === 'confirmed' ? 'bg-blue-200 text-blue-800' :
                              payments.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {payments.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                payments.payment_method === 'Bank Transfer' ? 'bg-green-200 text-green-800' :
                                payments.payment_method === 'Cash' ? 'bg-blue-200 text-blue-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {payments.payment_method}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewReciept(payments.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                              >
                                View Reciept
                              </button>
                           
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div></div>
      </div>
    </>
  );
};

export default ClientPaymentsViewPage;