import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useParams} from 'react-router-dom';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useUser } from '../services/UserContext';
import { useNavigate } from 'react-router-dom';
import { fetchPayments } from '../services/Api';

const ReceiptPage = () => {
  const { id } = useParams();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {companyInfo} = useUser()
  const receiptRef = useRef(null);
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch company info and payment data
    const fetchData = async () => {
      try {
        const paymentRes = await fetchPayments(id)
        
    
        setPayment(paymentRes);
        
      } catch (error) {
        console.error('Error fetching data:',error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const downloadPDF = () => {
    const input = receiptRef.current;
    
    html2canvas(input, {
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`receipt-${payment.receipt_number}.pdf`);
    });
  };

  if (loading) {
    return (
      <>
       <Navbar/>
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-[#d9b683]" />
      </div>
      </>
    );
  }
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  if (!companyInfo || !payment) return <div className="text-center mt-8">No data available</div>;

  return (
    
    <div className="min-h-screen bg-gray-50 py-30 px-4 sm:px-6 lg:px-8">
      <div ref={receiptRef} className="max-w-3xl mx-auto bg-white shadow-md rounded overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-black/60 text-white p-6">
          <div className="flex justify-between items-start">
            <div className=''>
              <h1 className="text-2xl font-bold">{companyInfo[0].name}</h1>
              {/* <p className="mt-1">{companyInfo[0].address}</p> */}
              
              <p className="mt-2">Phone: {companyInfo[0].phone}</p>
              <p>Email: {companyInfo[0].email}</p>
              {companyInfo.website && <p>Website: {companyInfo[0].website}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold">RECEIPT</h2>
              <p className="mt-2">Receipt #: {payment.receipt_number}</p>
              <p>Date: {formatDate(payment.receipt_issued_at)}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 border-b">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <p className="text-gray-600">Invoice #: {payment.invoice.invoice_number}</p>
              <p className="text-gray-600">Transaction ID: {payment.transaction_id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Status: 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  payment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {payment.status}
                </span>
              </p>
              <p className="text-gray-600">Method: {payment.payment_method}</p>
            </div>
          </div>
        </div>

        {/* Amounts */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">Invoice Amount</h4>
              <p className="text-xl">{formatCurrency(payment.invoice.total_amount)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Amount Paid</h4>
              <p className="text-xl text-green-600">{formatCurrency(payment.amount_paid)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Previous Payments</h4>
              <p className="text-xl">{formatCurrency(payment.invoice.total_payments_made - payment.amount_paid)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Balance</h4>
              <p className="text-xl">{formatCurrency(payment.invoice.total_amount-payment.invoice.total_payments_made)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="p-6 border-b">
            <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
            <p className="text-gray-600">{payment.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-gray-50">
          <div className="text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
            <p className="mt-2">For any inquiries, please contact {companyInfo.name} at {companyInfo.email}</p>
            <p className="mt-4">This is an official receipt. Please retain for your records.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-3xl mx-auto mt-4 flex justify-end space-x-4">
        <button 
          onClick={() => navigate('/dashboard/payments')}
          className="bg-black/60 hover:bg-black/40 text-white font-medium py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-black/60 hover:bg-black/40 text-white font-medium py-2 px-4 rounded"
        >
          Print Receipt
        </button>
        <button 
          onClick={downloadPDF}
          className="bg-[#d9b683] hover:bg-[#d9b683]/80 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ReceiptPage;