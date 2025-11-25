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
          font-size: 12px;
          line-height: 1.2;
        }
        .no-print {
          display: none !important;
        }
        .invoice-container {
          box-shadow: none;
          border: none;
          padding: 0;
          margin: 0;
          width: 100% !important;
        }
        .print-break-avoid {
          page-break-inside: avoid;
        }
        .print-mt-0 {
          margin-top: 0 !important;
        }
        table {
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
      }
      @media print and (max-width: 768px) {
        body {
          font-size: 10px;
        }
        .invoice-container {
          transform: scale(0.8);
          transform-origin: top left;
          width: 125% !important;
        }
      }
    `,
    documentTitle: `Invoice_${bookingData?.id || ''}_${new Date().toISOString().slice(0, 10)}`
  });

 const handleDownloadPDF = () => {
  setTimeout(() => {
    handlePrint();
  }, 100);
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
  const totalAmount = bookingData.total_amount;
  const totalPaid = bookingData.total_payments_made;
  const balanceDue = totalAmount - totalPaid;

  // Format date
  const invoiceDate = new Date(bookingData.created_at).toLocaleDateString();
  const dueDate = new Date(bookingData.wedding_date).toLocaleDateString();

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        <div className="fixed h-screen">
        <DashboardLayout /></div>
        <div className="flex-1 md:ml-64 p-3 sm:p-4 lg:p-6 w-full overflow-x-hidden">
        <div className="flex-1 p-4 lg:p-6">
          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow my-4 lg:my-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 lg:p-6 no-print">
              {/* <button
                onClick={() => navigate('/dashboard/bookings')}
                className="flex items-center px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 w-full sm:w-auto justify-center"
              >
                <FaArrowLeft className="mr-2" /> Back
              </button> */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center px-4 py-2 rounded bg-[#d9b683] text-white hover:bg-[#414141] w-full sm:w-auto"
                >
                  <FaFilePdf className="mr-2" /> Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
                >
                  <FaPrint className="mr-2" /> Print Invoice
                </button>
              </div>
            </div>

            <div ref={invoiceRef} className="invoice-container p-4 lg:p-8 bg-white print:p-0">
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-start gap-6 mb-8 print-break-avoid">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{companyInfo[0]?.name || 'Your Company'}</h1>
                  <p className="text-gray-600 text-sm lg:text-base">{companyInfo[0]?.address || '123 Business Street'}</p>
                  <p className="text-gray-600 text-sm lg:text-base">{companyInfo[0]?.city || 'Enugu'}, {companyInfo[0]?.state || 'State'} {companyInfo?.zip || ''}</p>
                  <p className="text-gray-600 text-sm lg:text-base">Phone: {companyInfo[0]?.phone || '(123) 456-7890'}</p>
                  <p className="text-gray-600 text-sm lg:text-base">Email: {companyInfo[0]?.email || 'info@company.com'}</p>
                </div>
                <div className="text-left lg:text-right flex-1">
                  <h2 className="text-xl lg:text-2xl font-bold text-[#d9b683] mb-2">INVOICE</h2>
                  <p className="text-gray-600 text-sm lg:text-base">Invoice #: {bookingData.id}</p>
                  <p className="text-gray-600 text-sm lg:text-base">Date: {invoiceDate}</p>
                  <p className="text-gray-600 text-sm lg:text-base">Due Date: {dueDate}</p>
                </div>
              </div>

              {/* Client and Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 mb-8 print-break-avoid">
                <div className="bg-gray-50 p-3 lg:p-4 rounded">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Bill To</h3>
                  <p className="font-medium text-sm lg:text-base">{bookingData.client_name || 'Client Name'}</p>
                  <p className="text-gray-600 text-sm lg:text-base">{bookingData.email || 'client@example.com'}</p>
                  <p className="text-gray-600 text-sm lg:text-base">{bookingData.phone || 'Phone number'}</p>
                </div>
                <div className="bg-gray-50 p-3 lg:p-4 rounded">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Event Details</h3>
                  <p className="font-medium text-sm lg:text-base">{bookingData.event_type || 'Event Type'}</p>
                  <p className="text-gray-600 text-sm lg:text-base">Date: {dueDate}</p>
                  <p className="text-gray-600 text-sm lg:text-base">Location: {bookingData.location || 'Event Location'}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8 print-break-avoid">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm lg:text-base">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold text-gray-700 border-b text-xs lg:text-sm">Item</th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold text-gray-700 border-b text-xs lg:text-sm hidden sm:table-cell">Description</th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold text-gray-700 border-b text-xs lg:text-sm">Price</th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold text-gray-700 border-b text-xs lg:text-sm">Qty</th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold text-gray-700 border-b text-xs lg:text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.slice().sort((a, b) => {
                        if (a.item_type === 'discount' && b.item_type !== 'discount') return 1;
                        if (a.item_type !== 'discount' && b.item_type === 'discount') return -1;
                        return 0;
                      }).map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 border-b text-xs lg:text-sm">
                            <div>
                              <span className="font-medium">{item.description}</span>
                              {item.item_type === 'addon' && <span className="text-xs text-gray-500 ml-1">(Addon)</span>}
                              {item.item_type === 'package' && <span className="text-xs text-gray-500 ml-1">(Package)</span>}
                              <div className="sm:hidden text-xs text-gray-600 mt-1">
                                {item.deliverables}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-left border-b text-xs lg:text-sm hidden sm:table-cell">{item.deliverables}</td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-right border-b text-xs lg:text-sm">₦{item.item_type=='discount'? -item.price.toLocaleString():item.price.toLocaleString()}</td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-right border-b text-xs lg:text-sm">{item.quantity}</td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-right border-b font-medium text-xs lg:text-sm">
                            ₦{item.item_type=='discount'? (-item.price * item.quantity).toLocaleString():(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end print-break-avoid">
                <div className="w-full lg:w-1/2">
                  <div className="bg-gray-50 p-3 lg:p-4 rounded">
                    <div className="flex justify-between py-2 border-b text-sm lg:text-base">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-medium">N{totalAmount.toLocaleString()}</span>
                    </div>
                    {payments.length > 0 && (
                      <div className="flex justify-between py-2 border-b text-sm lg:text-base">
                        <span className="font-medium">Total Paid:</span>
                        <span className="font-medium text-green-600">N{totalPaid.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 text-sm lg:text-base">
                      <span className="font-bold">Balance Due:</span>
                      <span className={`font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        N{Math.abs(balanceDue).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms of Service */}
              <div className="mt-8 print-break-avoid print-mt-0">
                <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2 text-sm lg:text-base">Terms & Conditions</h3>
                <div className="bg-gray-50 p-3 lg:p-4 rounded text-xs lg:text-sm">
                  <ul className="list-disc pl-4 lg:pl-5 space-y-1 lg:space-y-2">
                    <li>All bookings are subject to availability.</li>
                    <li>Cancellations made within 30 days of the event date may incur a cancellation fee.</li>
                    <li>We reserve the right to substitute equipment or personnel of equal quality if necessary.</li>
                    <li>Client is responsible for providing a safe working environment for our staff.</li>
                    <li>Additional charges may apply for services requested beyond the original scope of work.</li>
                  </ul>
                  <div className="mt-3 lg:mt-4">
                    <p className="font-medium">Acceptance of Terms:</p>
                    <p>By making a payment, you agree to the terms and conditions outlined above.</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 lg:mt-12 pt-4 border-t border-gray-200 text-center text-gray-500 text-xs lg:text-sm print-break-avoid">
                <p>{companyInfo?.name || 'Your Company'} - Thank you for your business!</p>
                <p className="mt-1">{companyInfo?.slogan || 'Quality services for your special day'}</p>
              </div>
            </div>
          </div>
        </div>
      </div></div>
    </>
  );
};

export default Invoice;