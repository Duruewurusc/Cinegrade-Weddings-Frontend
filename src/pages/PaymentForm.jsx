// components/PaymentForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaReceipt, FaPrint, FaEdit } from 'react-icons/fa';
import { fetchBookings } from '../services/Api';
import { createPayment, updatePayment } from '../services/Api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';

const PaymentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice_id');

  const [formData, setFormData] = useState({
    invoice: invoiceId || '',
    amount_paid: '',
    payment_method: 'Bank Transfer',
    status: 'Pending',
    transaction_id: '',
    notes: '',
    payment_date: new Date().toISOString().split('T')[0] // Default to today's date
  });

  const [bookings, setBookings] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Update form when invoiceId changes
  useEffect(() => {
    if (invoiceId) {
      setFormData(prev => ({ ...prev, invoice: invoiceId }));
      loadInvoiceDetails(invoiceId);
    }
  }, [invoiceId]);

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
      
      // If invoice_id is provided, find and set the selected invoice
      if (invoiceId) {
        const invoice = data.find(booking => booking.id === parseInt(invoiceId));
        if (invoice) {
          setSelectedInvoice(invoice);
          console.log('Selected Invoice:', invoice); // Debugging log
        }
        console.log('Selected Invoice:', invoice); // Debugging log
      }
    } catch (err) {
      setError('Failed to load bookings');
    }
  };

  const loadInvoiceDetails = (id) => {
    const invoice = bookings.find(booking => booking.id === parseInt(id));
    setSelectedInvoice(invoice);
    
    if (invoice) {
      // Pre-fill amount_paid with remaining balance
      const remainingBalance = invoice.total_amount - (invoice.total_payments_made || 0);
      setFormData(prev => ({
        ...prev,
        amount_paid: remainingBalance > 0 ? remainingBalance : ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If invoice selection changes, load its details
    if (name === 'invoice') {
      loadInvoiceDetails(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.invoice) {
        throw new Error('Please select an invoice');
      }
      if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!formData.payment_date) {
        throw new Error('Please select a payment date');
      }

      const paymentData = {
        ...formData,
        amount_paid: parseFloat(formData.amount_paid),
        invoice: parseInt(formData.invoice)
      };

      // Create or update payment
      console.log('Submitting Payment Data:', paymentData); // Debugging log
      const response = await createPayment(paymentData);
      
      // Navigate to receipt page
      navigate(`/dashboard/receipt/${response.id}`);
    } catch (err) {
      setError(err.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = () => {
    if (!selectedInvoice) return 0;
    const paid = parseFloat(formData.amount_paid) || 0;
    const total = selectedInvoice.total_amount || 0;
    const previousPayments = selectedInvoice.total_payments_made || 0;
    return total - previousPayments - paid;
  };

  return (
    <>
    <Navbar/>
    <div className="flex h-screen bg-gray-100">
          <div className="fixed h-screen">
              <DashboardLayout />
            </div>
      <div 
           className="flex-1 md:ml-64 p-4 overflow-y-auto"
          style={{ 
            height: 'calc(100vh - 4rem)', // Adjust based on Navbar height
            width: '100%', // Ensure full width on mobile
          }}
        >      
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            {/* <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button> */}
            <h1 className="text-2xl font-bold text-gray-800">
              {invoiceId ? 'Update Payment' : 'Create New Payment'}
            </h1>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Invoice *
              </label>
              <select
                name="invoice"
                value={formData.invoice}
                onChange={handleInputChange}
                required
                disabled={!!invoiceId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select an invoice</option>
                {bookings.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {booking.booking_code} - {booking.client} - ₦{booking.total_amount}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Details */}
            {selectedInvoice && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <p className="font-medium">{selectedInvoice.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium">₦{selectedInvoice.total_amount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Previous Payments:</span>
                    <p className="font-medium">₦{selectedInvoice.total_payments_made || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Remaining Balance:</span>
                    <p className="font-medium text-red-600">
                      ₦{selectedInvoice.total_amount - (selectedInvoice.total_payments_made || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid *
                </label>
                <input
                  type="number"
                  name="amount_paid"
                  value={formData.amount_paid}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleInputChange}
                  placeholder="Payment gateway reference"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional payment notes..."
              />
            </div>

            {/* Balance Calculation */}
            {selectedInvoice && formData.amount_paid && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Balance After Payment</h3>
                <div className="text-lg font-bold text-blue-800">
                  ₦{calculateBalance().toFixed(2)}
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  This payment will reduce the outstanding balance from ₦{(selectedInvoice.total_amount - (selectedInvoice.total_payments_made || 0)).toFixed(2)} to ₦{calculateBalance().toFixed(2)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-[#d9b683] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      </div></div>  
    </div></div></>
  );
};

export default PaymentForm;