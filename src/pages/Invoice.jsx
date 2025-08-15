import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FaPrint, FaFilePdf, FaArrowLeft } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../services/UserContext';
import { fetchBookings } from '../services/Api';
import { fetchInvoiceItem } from '../services/Api';
import { fetchPayments } from '../services/Api';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, companyInfo } = useUser();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booking, invoiceItemsRes, paymentsRes] = await Promise.all([
          fetchBookings(id),
          fetchInvoiceItem(),
          fetchPayments()
        ]);

        setBookingData(booking);
        setInvoiceItems(invoiceItemsRes.filter(item => item.invoice === booking.id));
        setPayments(paymentsRes.filter(payment => payment.invoice.id === booking.id));
      } catch (error) {
        console.error('Error fetching invoice data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          padding: 0;
          margin: 0;
        }
        .no-print {
          display: none !important;
        }
        .invoice-container {
          box-shadow: none;
          border: none;
          padding: 0;
        }
      }
    `,
    documentTitle: `Invoice_${bookingData?.id || ''}_${new Date().toISOString().slice(0, 10)}`
  });

  const handleDownloadPDF = () => {
    // In a real implementation, you would generate a PDF here
    // For now, we'll just trigger the print dialog which can be saved as PDF
    handlePrint();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen bg-gray-100">
          <DashboardLayout />
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow my-20 flex justify-center items-center">
            <div>Loading invoice data...</div>
          </div>
        </div>
      </>
    );
  }

  if (!bookingData) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen bg-gray-100">
          <DashboardLayout />
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow my-20 flex justify-center items-center">
            <div>Invoice not found</div>
          </div>
        </div>
      </>
    );
  }

  // Calculate totals
  const totalAmount = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPaid = bookingData.total_payments_made;
  const balanceDue = totalAmount - totalPaid;

  // Format date
  const invoiceDate = new Date(bookingData.created_at).toLocaleDateString();
  const dueDate = new Date(bookingData.wedding_date).toLocaleDateString();

  return (
    <>
      <Navbar />
      
       
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow my-20">
          <div className="flex justify-between items-center mb-6 no-print">
            <button
              onClick={() => navigate('/dashboard/bookings')}
              className="flex items-center px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
            <div className="flex space-x-4">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center px-4 py-2 rounded bg-[#d9b683] text-white hover:bg-[#414141]"
              >
                <FaFilePdf className="mr-2" /> Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                <FaPrint className="mr-2" /> Print Invoice
              </button>
            </div>
          </div>

          <div ref={invoiceRef} className="invoice-container p-8 bg-white">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{companyInfo[0]?.name || 'Your Company'}</h1>
                <p className="text-gray-600">{companyInfo[0]?.address || '123 Business Street'}</p>
                <p className="text-gray-600">{companyInfo[0]?.city || 'Enugu'}, {companyInfo[0]?.state || 'State'} {companyInfo?.zip || ''}</p>
                <p className="text-gray-600">Phone: {companyInfo[0]?.phone || '(123) 456-7890'}</p>
                <p className="text-gray-600">Email: {companyInfo[0]?.email || 'info@company.com'}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-[#d9b683] mb-2">INVOICE</h2>
                <p className="text-gray-600">Invoice #: {bookingData.id}</p>
                <p className="text-gray-600">Date: {invoiceDate}</p>
                <p className="text-gray-600">Due Date: {dueDate}</p>
              </div>
            </div>

            {/* Client and Event Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-800 mb-2">Bill To</h3>
                <p className="font-medium">{bookingData.client_name || 'Client Name'}</p>
                <p className="text-gray-600">{bookingData.email || 'client@example.com'}</p>
                <p className="text-gray-600">{bookingData.phone || 'Phone number'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-800 mb-2">Event Details</h3>
                <p className="font-medium">{bookingData.event_type || 'Event Type'}</p>
                <p className="text-gray-600">Date: {dueDate}</p>
                <p className="text-gray-600">Location: {bookingData.location || 'Event Location'}</p>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Item</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Description</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b">Price</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b">Qty</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 border-b">
                        {item.description}
                        {item.item_type === 'addon' && <span className="text-xs text-gray-500 ml-2">(Addon)</span>}
                        {item.item_type === 'package' && <span className="text-xs text-gray-500 ml-2">(Package)</span>}
                      </td>
                      <td className="py-3 px-4 text-left border-b">{item.deliverables}</td>
                      <td className="py-3 px-4 text-right border-b">N{item.price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right border-b">{item.quantity}</td>
                      <td className="py-3 px-4 text-right border-b font-medium">
                        N{(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">N{totalAmount.toLocaleString()}</span>
                  </div>
                  {payments.length > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Total Paid:</span>
                      <span className="font-medium text-green-600">N{totalPaid.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="font-bold">Balance Due:</span>
                    <span className={`font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      N{Math.abs(balanceDue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Terms & Conditions</h3>
              <div className="bg-gray-50 p-4 rounded text-sm">
                <ul className="list-disc pl-5 space-y-2">
                  <li>All bookings are subject to availability.</li>
                  <li>Cancellations made within 30 days of the event date may incur a cancellation fee.</li>
                  <li>We reserve the right to substitute equipment or personnel of equal quality if necessary.</li>
                  <li>Client is responsible for providing a safe working environment for our staff.</li>
                  <li>Additional charges may apply for services requested beyond the original scope of work.</li>
                </ul>
                <div className="mt-4">
                  <p className="font-medium">Acceptance of Terms:</p>
                  <p>By making a payment, you agree to the terms and conditions outlined above.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>{companyInfo?.name || 'Your Company'} - Thank you for your business!</p>
              <p className="mt-1">{companyInfo?.slogan || 'Quality services for your special day'}</p>
            </div>
          </div>
        </div>
     
    </>
  );
};

export default Invoice;