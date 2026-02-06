import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiDollarSign, 
  FiCheckCircle, 
  FiClock,
  FiEye,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiCreditCard,
  FiPercent,
  FiTrendingUp
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout/';
import api from '../services/Api';

const ClientPaymentsViewPage = () => {
  const [booking, setBooking] = useState(null);
  const [payments, setPayment] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();

  // Calculate analytics with balance metrics
  const analytics = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const confirmed = payments.filter(p => p.status === 'confirmed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
    const totalBalance = payments.reduce((sum, p) => {
      const remaining = parseFloat(p.total_amount || 0) - parseFloat(p.amount_paid || 0);
      return sum + Math.max(0, remaining);
    }, 0);
    const averageBalance = total > 0 ? totalBalance / total : 0;
    
    return {
      total,
      completed,
      confirmed,
      pending,
      totalAmount: totalAmount.toFixed(2),
      totalBalance: totalBalance.toFixed(2),
      averageBalance: averageBalance.toFixed(2),
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      paidPercentage: totalAmount > 0 ? ((totalAmount / (totalAmount + totalBalance)) * 100).toFixed(1) : 0
    };
  }, [payments]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await api.get('/api/payments/', config);
        const booking_response = await api.get('/api/bookings/', config);
        setPayment(response.data);
        setBooking(booking_response.data);
        setFilteredPayments(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let results = payments;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(payment => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (payment.invoice?.booking_code?.toLowerCase().includes(searchLower)) ||
          (payment.client_name?.toLowerCase().includes(searchLower)) ||
          (payment.receipt_number?.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Apply payment status filter
    if (paymentFilter !== 'all') {
      results = results.filter(payment => payment.status === paymentFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      results = results.filter(payment => payment.payment_date === dateFilter);
    }
    
    setFilteredPayments(results);
  }, [searchTerm, paymentFilter, dateFilter, payments]);

  // Calculate balance remaining for a payment
  const calculateBalanceRemaining = (payment) => {
    const totalAmount = parseFloat(payment.invoice_details.total_amount || 0);
    const amountPaid = parseFloat(payment.invoice_details.total_payments_made || 0);
    const remaining = totalAmount - amountPaid;
    return Math.max(0, remaining); // Don't show negative balance
  };

  // Calculate payment percentage
  const calculatePaymentPercentage = (payment) => {
    const totalAmount = parseFloat(payment.invoice_details.total_amount || 0);
    const amountPaid = parseFloat(payment.invoice_details.total_payments_made || 0);
    if (totalAmount === 0) return 100;
    return Math.min(100, (amountPaid / totalAmount) * 100);
  };

  const handleViewReceipt = (receiptId) => {
    navigate(`/dashboard/receipt/${receiptId}`);
  };

  const handleDeletePayment = async (paymentId, event) => {
    event.stopPropagation(); // Prevent row click
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        await api.delete(`/api/payments/${paymentId}/`, config);
        
        // Remove payment from state
        setPayment(prev => prev.filter(p => p.id !== paymentId));
        setFilteredPayments(prev => prev.filter(p => p.id !== paymentId));
        
        alert('Payment deleted successfully!');
      } catch (err) {
        alert('Failed to delete payment: ' + err.message);
      }
    }
  };

  const toggleRowExpansion = (paymentId, event) => {
    event.stopPropagation();
    setExpandedRows(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPaymentFilter('all');
    setDateFilter('');
    setShowMobileFilters(false);
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="flex h-screen bg-gray-50">
        <div className="fixed h-screen z-40">
          <DashboardLayout />
        </div>

        {/* Main Content */}
        <div 
          className="flex-1 lg:ml-64 p-4 md:p-6 overflow-y-auto"
          style={{ 
            height: 'calc(100vh - 4rem)',
            width: '100%',
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payments</h1>
              <p className="text-gray-600 text-sm md:text-base">View and manage all client payments</p>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <span className="flex items-center gap-2">
                  <FiFilter />
                  {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                </span>
                {showMobileFilters ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className={`mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 ${
              showMobileFilters ? 'block' : 'hidden md:block'
            }`}>
              <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:flex md:gap-3">
                  <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hidden md:block" />
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full pl-3 md:pl-10 pr-8 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm md:text-base"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hidden md:block" />
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full pl-3 md:pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    <FiRefreshCw />
                    Reset Filters
                  </button>
                </div>
              </div>
              
              {payments.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 text-center md:text-left">
                  Showing {filteredPayments.length} of {payments.length} payments
                </div>
              )}
            </div>

            {/* Analytics Cards - Merged Completed/Pending */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Total Collected</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1 hidden md:block">
                      {analytics.paidPercentage}% of total
                    </p>
                  </div>
                  <div className="p-2 md:p-3 bg-green-50 rounded-lg">
                    <FiDollarSign className="text-xl md:text-2xl text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Balance Remaining</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalBalance)}</p>
                    <p className="text-xs text-gray-500 mt-1 hidden md:block">
                      Avg: {formatCurrency(analytics.averageBalance)}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-50 rounded-lg">
                    <FiCreditCard className="text-xl md:text-2xl text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Merged Payment Status Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Payment Status</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{analytics.total} Total</p>
                  </div>
                  <div className="p-2 md:p-3 bg-purple-50 rounded-lg">
                    <FiTrendingUp className="text-xl md:text-2xl text-purple-600" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Completed */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs md:text-sm text-gray-700">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{analytics.completed}</span>
                      <span className="text-xs text-gray-500">
                        ({analytics.total > 0 ? Math.round((analytics.completed / analytics.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  {/* Confirmed */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs md:text-sm text-gray-700">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{analytics.confirmed}</span>
                      <span className="text-xs text-gray-500">
                        ({analytics.total > 0 ? Math.round((analytics.confirmed / analytics.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  {/* Pending */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs md:text-sm text-gray-700">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{analytics.pending}</span>
                      <span className="text-xs text-gray-500">
                        ({analytics.total > 0 ? Math.round((analytics.pending / analytics.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="flex h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${analytics.total > 0 ? (analytics.completed / analytics.total) * 100 : 0}%` }}
                        ></div>
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: `${analytics.total > 0 ? (analytics.confirmed / analytics.total) * 100 : 0}%` }}
                        ></div>
                        <div 
                          className="bg-yellow-500 h-full" 
                          style={{ width: `${analytics.total > 0 ? (analytics.pending / analytics.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Completion Rate: {analytics.completionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table - Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {payments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FiDollarSign className="text-3xl text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                  <p className="text-gray-600">Payments will appear here once they are created.</p>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                    <FiSearch className="text-3xl text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Booking & Client
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Amount Paid & Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Balance Remaining
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPayments.map((payment) => {
                        const balanceRemaining = calculateBalanceRemaining(payment);
                        const paymentPercentage = calculatePaymentPercentage(payment);
                        
                        return (
                          <tr 
                            key={payment.id} 
                            onClick={() => handleViewReceipt(payment.id)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {payment.invoice_details?.booking_code || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                  <FiUser className="text-gray-400" />
                                  {payment.invoice_details.client_name || 'Unnamed Client'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <FiCalendar className="text-gray-400" />
                                <span className="text-gray-900">
                                  {formatDate(payment.payment_date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="font-semibold text-gray-900">
                                  {formatCurrency(payment.amount_paid)}
                                </div>
                                <div>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    payment.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : payment.status === 'confirmed' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div className={`font-semibold ${
                                  balanceRemaining === 0 
                                    ? 'text-green-600' 
                                    : balanceRemaining > 0 
                                    ? 'text-yellow-600' 
                                    : 'text-gray-900'
                                }`}>
                                  {formatCurrency(balanceRemaining)}
                                </div>
                                {payment.total_amount && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full" 
                                      style={{ width: `${paymentPercentage}%` }}
                                    ></div>
                                  </div>
                                )}
                                {payment.total_amount && (
                                  <div className="text-xs text-gray-500">
                                    {paymentPercentage.toFixed(0)}% of {formatCurrency(payment.total_amount)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleViewReceipt(payment.id)}
                                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                  <FiEye />
                                  View
                                </button>
                                <button
                                  onClick={(e) => handleDeletePayment(payment.id, e)}
                                  className="p-2 text-[#d9b683] hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Payment"
                                >
                                  <FiTrash2 className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payments Cards - Mobile */}
            <div className="md:hidden space-y-3">
              {payments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FiDollarSign className="text-3xl text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                  <p className="text-gray-600 text-sm">Payments will appear here once they are created.</p>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="mx-auto w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                    <FiSearch className="text-3xl text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Found</h3>
                  <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredPayments.map((payment) => {
                  const balanceRemaining = calculateBalanceRemaining(payment);
                  const paymentPercentage = calculatePaymentPercentage(payment);
                  
                  return (
                    <div 
                      key={payment.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div 
                        className="p-4"
                        onClick={() => handleViewReceipt(payment.id)}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {payment.invoice?.booking_code || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <FiUser className="text-gray-400" />
                              <span className="truncate">
                                {payment.client_name || 'Unnamed Client'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => toggleRowExpansion(payment.id, e)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            {expandedRows.includes(payment.id) ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>

                        {/* Payment Info */}
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Paid</div>
                            <div className="font-bold text-lg text-gray-900">
                              {formatCurrency(payment.amount_paid)}
                            </div>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : payment.status === 'confirmed' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Balance</div>
                            <div className={`font-bold text-lg ${
                              balanceRemaining === 0 
                                ? 'text-green-600' 
                                : balanceRemaining > 0 
                                ? 'text-yellow-600' 
                                : 'text-gray-900'
                            }`}>
                              {formatCurrency(balanceRemaining)}
                            </div>
                            {payment.total_amount && (
                              <div className="text-xs text-gray-500 mt-1">
                                {paymentPercentage.toFixed(0)}% paid
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {payment.total_amount && (
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${paymentPercentage}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0</span>
                              <span>{formatCurrency(payment.total_amount)}</span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCalendar className="text-gray-400" />
                            <span>{formatDate(payment.payment_date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleViewReceipt(payment.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FiEye />
                              View
                            </button>
                            <button
                              onClick={(e) => handleDeletePayment(payment.id, e)}
                              className="p-2 text-[#d9b684] hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Payment"
                            >
                              <FiTrash2 className="text-lg" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedRows.includes(payment.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                                <div className="font-medium text-gray-900">
                                  {formatCurrency(payment.total_amount || 0)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Payment %</div>
                                <div className="font-medium text-gray-900">
                                  {paymentPercentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            {payment.receipt_number && (
                              <div className="text-sm text-gray-600">
                                Receipt: {payment.receipt_number}
                              </div>
                            )}
                            {balanceRemaining > 0 && (
                              <div className="text-sm text-yellow-600 font-medium">
                                <FiPercent className="inline mr-1" />
                                {formatCurrency(balanceRemaining)} remaining to collect
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientPaymentsViewPage;