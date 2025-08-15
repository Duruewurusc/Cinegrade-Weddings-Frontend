import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaFilePdf, FaCheck, FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaBoxOpen, FaFileInvoice, FaUser,FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import { MdDescription, } from 'react-icons/md';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout/';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useUser } from "../services/UserContext";
import { fetchBookings } from '../services/Api';


const Invoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {companyInfo} = useUser()



  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log(token)



        const [bookingRes, packagesRes, addonsRes, companyRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/bookings/${id}/`, config),
          axios.get('http://127.0.0.1:8000/api/package/', config),
          axios.get('http://127.0.0.1:8000/api/addon/', config),
         
        ]);
        
      

        setBooking(bookingRes.data);
        setPackages(packagesRes.data);
        setAddons(addonsRes.data);
 
      } catch (error) {
        console.error('Error fetching data:',error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // practice this code to map list to another list
  const getPackageNames = () => {
    if (!booking) return [];
    return booking.packages.map(id => {
      const pkg = packages.find(p => p.id === id);
      return pkg ;
    });
  };

  const getAddonNames = () => {
    if (!booking) return [];
    return booking.Addons.map(id => {
      const addon = addons.find(a => a.id === id);
      return addon ;
    });
  };
   

    console.log(getPackageNames())
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
  if (error) {
    return (
      <>
       <Navbar/>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div></>
    );
  }

  if (!booking) {
    return (
      <>
      <Navbar/>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Booking not found
        </div>
      </div></>
    );
  }

    // Calculate totals
  const packageTotal = getPackageNames().reduce((sum, pkg) => sum + parseFloat(pkg.price), 0);
  const addonTotal = getAddonNames().reduce((sum, addon) => sum + (parseFloat(addon.price) * addon.quantity), 0);
  const subtotal = packageTotal + addonTotal;
  const taxAmount = subtotal * (booking.tax_rate / 100);
  const totalAmount = subtotal + taxAmount;



  return (
    <>
   
    <Navbar/>
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm mt-10">
     
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">
        <div>
          {companyInfo?.logo && (<img src={companyInfo.logo} alt={companyInfo.name} className="h-16 mb-2"/>
          )}
          <h1 className="text-3xl font-bold text-gray-800">{companyInfo[0].name || 'Capture Studio'}</h1>
          <p className="text-sm text-gray-500">{companyInfo[0].brand_message || 'Wedding Photography & Videography Company'}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-700">INVOICE</h2>
          <p className="text-sm text-gray-600">{booking.invoice_number}</p>
          <p className="text-sm text-gray-600">
            Date: {format(new Date(booking.issue_date), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Client and Wedding Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">BILLED TO</h3>
          <p className="font-medium">{booking.client_name}</p>
          <p className="text-sm">{booking.address}</p>
          <p className="text-sm">{booking.email}</p>
          <p className="text-sm">{booking.phone}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">WEDDING DETAILS</h3>
          <p className="text-sm">
            <span className="font-medium">Date:</span> {format(new Date(booking.wedding_date), 'MMM dd, yyyy')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Venue:</span> {booking.location}
          </p>
          <p className="text-sm">
            <span className="font-medium">Event Type:</span> {booking.event_type}
          </p>
          {booking.event_description && (
            <p className="text-sm">
              <span className="font-medium">Description:</span> {booking.event_description}
            </p>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#e0e0e0] text-left">
              <th className="py-2 px-3 font-bold text-gray-700 border-b">SERVICE</th>
              <th className="py-2 px-3 font-bold text-gray-700 border-b text-right">QTY</th>
              <th className="py-2 px-3 font-bold text-gray-700 border-b text-right">RATE</th>
              <th className="py-2 px-3 font-bold text-gray-700 border-b text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {getPackageNames().map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-3 border-b">
                  {item.description}
                  {item.is_taxable && <span className="text-xs text-gray-500 ml-2">(taxable)</span>}
                </td>
                <td className="py-3 px-3 border-b text-right">{item.quantity}</td>
                <td className="py-3 px-3 border-b text-right">
                  {item.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'NGN'
                  })}
                </td>
                <td className="py-3 px-3 border-b text-right font-medium">
                  {(item.quantity * item.unit_price).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'NGN'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">PAYMENT STATUS</h3>
          <p className="text-sm">
            <span className="font-medium">Status:</span> {booking.payment_status}
          </p>
          <p className="text-sm">
            <span className="font-medium">Amount Paid:</span>{' '}
            {booking.total_payments_made?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'NGN'
            }) || '₦0.00'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Balance Due:</span>{' '}
            {booking.amount_due?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'NGN'
            }) || '₦0.00'}
          </p>
          {booking.due_date && (
            <p className="text-sm">
              <span className="font-medium">Due Date:</span>{' '}
              {format(new Date(booking.due_date), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
        <div>
          <div className="text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>
                {subtotal.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'NGN'
                })}
              </span>
            </div>
            {booking.tax_rate > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Tax ({booking.tax_rate}%):</span>
                  <span>
                    {taxAmount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'NGN'
                    })}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>TOTAL:</span>
              <span className="text-lg">
                {totalAmount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'NGN'
                })}
              </span>
            </div>
          </div>
        </div>
        <div>
                <h3 className="font-bold text-gray-700 mb-2 border-b brand-border pb-1">PAYMENT METHODS</h3>
                <p className="text-sm mb-2">We accept:</p>
                <ul className="text-sm list-disc pl-5 mb-3">
                    <li>Bank Transfer (preferred)</li>
                </ul>
                <div className="pt-1 px-3 rounded text-sm">
                    <p><span className="font-medium brand-accent">Bank:</span>Fidelity Bank</p>
                    <p><span className="font-medium brand-accent">Account:</span> 123456789</p>
                    {/* <p><span className="font-medium brand-accent">Routing:</span> 021000021</p> */}
                </div>
            </div>
        

      </div>

      {/* Terms and Footer */}
      <div className="text-xs text-gray-600 border-t pt-4">
        <h3 className="font-bold text-gray-700 mb-1">TERMS & CONDITIONS</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Deposit is non-refundable and required to secure your date</li>
          <li>Final payment due 30 days before wedding date</li>
          <li>Delivery of images within 6-8 weeks after wedding</li>
          {companyInfo && (
            <li>
              Contact: {companyInfo.email} | {companyInfo.phone}
            </li>
          )}
        </ul>
        {companyInfo?.address && (
          <div className="mt-4 text-center">
            <p>{companyInfo.address}</p>
          </div>
        )}
      </div>
      
    </div>

    {/* Action Buttons */}
      <div className="max-w-3xl mx-auto mt-4 flex justify-center space-x-4 py-6">
        <button 
          onClick={() => navigate('/dashboard/bookings')}
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
          onClick={''}
          className="bg-[#d9b683] hover:bg-[#d9b683]/80 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>




      
      </>
  )
}

export default Invoice