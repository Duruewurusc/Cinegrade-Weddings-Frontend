import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaArrowRight, FaArrowLeft, FaCheck, FaPlus, FaMinus, FaEdit, FaSave, FaMoneyBillWave } from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import { useUser } from '../services/UserContext';
import { fetchClientList } from '../services/Api';
import { fetchPackage } from '../services/Api';
import { fetchAddon } from '../services/Api';
import { fetchInvoiceItem } from '../services/Api';
import { postBookings, updateBookings, fetchBookings } from '../services/Api';
import { postInvoiceItem, updateInvoiceItem, deleteInvoiceItem } from '../services/Api';
import { fetchPayments } from '../services/Api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';

const ViewEditBooking = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();
  const [payments, setPayments] = useState([]);


  // Form data
  const [formData, setFormData] = useState({
    client: user?.is_superuser ? '' : user?.id,
    event_type: '',
    event_description: '',
    wedding_date: '',
    location: '',
    additional_notes: ''
  });

  // Store booking data
  const [bookingData, setBookingData] = useState(null);

  // Invoice items
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [existingInvoiceItems, setExistingInvoiceItems] = useState([]);
  const [discount, setDiscount] = useState({});
  

  // Fetch booking data
  useEffect(() => {
    const fetchBookingData = async () => {
      setLoading(true);
      try {
        const booking = await fetchBookings(id);
        setBookingData(booking);
        setFormData({
          client: booking.client,
          event_type: booking.event_type,
          event_description: booking.event_description,
          wedding_date: booking.wedding_date,
          location: booking.location,
          additional_notes: booking.additional_notes
        });

        // Fetch invoice items
        const invoiceItems = await fetchInvoiceItem();
        
        const items = invoiceItems.filter(item => item.invoice === booking.id);
        // console.log(items)
        setExistingInvoiceItems(items);
        console.log(invoiceItems.find(i => i.is_discount)?.price,)

        // Fetch payments
        const paymentList = await fetchPayments();
        
        const paymentData = paymentList.filter(item => item.invoice.id === booking.id);
        setPayments(paymentData);

        // Separate packages and addons
        const packageItems = items.filter(item => item.item_type === 'package');
        const addonItems = items.filter(item => item.item_type === 'addon');
        const discountItems = items.filter(item => item.item_type === 'discount');
        const totalDiscount = discountItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

        console.log(totalDiscount)

        setSelectedPackages(packageItems.map(item => ({
          id: item.package,
          package_name: item.description,
          description: item.item_type,
          deliverables: item.deliverables,
          price: item.price,
          quantity: item.quantity
        })));
      

        setSelectedAddons(addonItems.map(item => ({
          id: item.addon,
          name: item.description,
          deliverables: item.deliverables,
          description: item.item_type,
          price: item.price,
          quantity: item.quantity
        })));

        setDiscount({
          id: '',
          name: 'Discount',
          description: '',
          price: totalDiscount,
          quantity: 1,
          is_discount: true,
          is_taxable: false,
          
        });

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [id, user?.id, user?.is_superuser]);

  // Fetch users if admin
  useEffect(() => {
    if (user?.is_superuser) {
      const fetchClients = async () => {
        try {
          const data = await fetchClientList();
          setUsers(data);
        } catch (error) {
          setError(error.message);
          console.error('Error fetching clients:', error);
        }
      };
      fetchClients();
    }
  }, [user?.is_superuser]);

  // Fetch packages and addons
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const [packagesRes, addonsRes] = await Promise.all([
          fetchPackage(),
          fetchAddon()
        ]);
        setPackages(packagesRes);
        setAddons(addonsRes);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching packages:', error);
      }
    };
    fetchPackages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePackageSelect = (pkg) => {
    if (!isEditing) return;
    
    setSelectedPackages(prev => {
      const exists = prev.find(item => item.id === pkg.id);
      if (exists) {
        return prev.filter(item => item.id !== pkg.id);
      } else {
        return [...prev, { ...pkg, quantity: 1 }];
      }
    });
  };

  const handleAddonSelect = (addon) => {
    if (!isEditing) return;
    
    setSelectedAddons(prev => {
      const exists = prev.find(item => item.id === addon.id);
      if (exists) {
        return prev.filter(item => item.id !== addon.id);
      } else {
        return [...prev, { ...addon, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (type, id, newQuantity) => {
    if (!isEditing) return;
    
    if (type === 'package') {
      setSelectedPackages(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
        )
      );
    } else {
      setSelectedAddons(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
        )
      );
    }
  };


  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        //
      // Update booking details
      await updateBookings(id, formData);
      setStep(2)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
      

  const handleUpdateBookingStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Get all current invoice items (packages + addons)
      console.log(selectedPackages)
      const currentItems = [
        ...selectedPackages.map(item => ({
          id: existingInvoiceItems.find(i => i.package === item.id)?.id,
          item_type: 'package',
          package: item.id,
          description: item.package_name,
          deliverables: item.deliverables,
          quantity: item.quantity,
          price: item.price,
          is_taxable: false
        })),
        ...selectedAddons.map(item => ({
          id: existingInvoiceItems.find(i => i.addon === item.id)?.id,
          item_type: 'addon',
          addon: item.id,
          description: item.name,
          deliverables: item.deliverables,
          quantity: item.quantity,
          price: item.price,
          is_taxable: true
        })),
         ...(discount.price > 0 ? [{
        id: existingInvoiceItems.find(i => i.is_discount)?.id,
        item_type: 'discount',
        description: discount.description || 'Discount',
        quantity: 1,
        // price: discount.type === 'amount' ? -discount.value : -(totalAmount * discount.value / 100),
        price: discount.price,
        is_taxable: false,
        is_discount: true
      }] : [])
    


      ];

      // Determine items to add, update, or delete
      const itemsToAdd = currentItems.filter(item => !item.id);
      console.log(itemsToAdd)
      const itemsToUpdate = currentItems.filter(item => 
        item.id && existingInvoiceItems.some(ei => ei.id === item.id && 
          (ei.quantity !== item.quantity || ei.price !== item.price))
      );
      const itemsToDelete = existingInvoiceItems.filter(ei => 
        !currentItems.some(item => 
          (item.item_type === 'package' && item.package === ei.package) ||
          (item.item_type === 'addon' && item.addon === ei.addon)
        )
      );

      // Execute all operations
      await Promise.all([
        ...itemsToAdd.map(item => postInvoiceItem({ ...item, invoice: id })),
        ...itemsToUpdate.map(item => updateInvoiceItem(item.id, item)),
        ...itemsToDelete.map(item => deleteInvoiceItem(item.id))
      ]);

      setIsEditing(false);
      // Refresh data
      const updatedBooking = await fetchBookings(id);
      setBookingData(updatedBooking);
      //
      //
      //
      //
      const invoiceItems = await fetchInvoiceItem();
        
      const items = invoiceItems.filter(item => item.invoice === booking.id);
      setExistingInvoiceItems(items);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
    // const totalDiscount = discount.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    // console.log(totalDiscount)
  const totalAmount = ([...selectedPackages, ...selectedAddons].reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  )) - discount.price;
  // const totalAmount = bookingData.total_amount
  // const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  // const balanceDue = totalAmount - totalPaid;

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset to original data when canceling edit
      setFormData({
        client: bookingData.client,
        event_type: bookingData.event_type,
        event_description: bookingData.event_description,
        wedding_date: bookingData.wedding_date,
        location: bookingData.location,
        additional_notes: bookingData.additional_notes
      });
      
      // Reset selected items
      const packageItems = existingInvoiceItems.filter(item => item.item_type === 'package');
      const addonItems = existingInvoiceItems.filter(item => item.item_type === 'addon');
      console.log(packageItems)
      const discountItems = items.filter(item => item.item_type === 'discount');

      setSelectedPackages(packageItems.map(item => ({
        id: item.package,
        package_name: item.description,
        description: item.item_type,
        deliverables: item.deliverables,
        price: item.price,
        quantity: item.quantity
      })));

      setSelectedAddons(addonItems.map(item => ({
          id: item.addon,
          name: item.description,
          deliverables: item.deliverables,
          description: item.item_type,
          price: item.price,
          quantity: item.quantity
      })));

      setDiscount(discountItems.map(item => ({
        id: item.id,
        name: item.item_type,
        description: item.description,
        price: item.price,
        quantity: 1,
        is_discount: true,
        is_taxable: false,
      })));

      
    }
  };

  if (loading && !bookingData) {
    return (
      <>
        <Navbar/>
        <div className="flex h-screen bg-gray-100">
          <DashboardLayout />
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow my-20 flex justify-center items-center">
            <div>Loading booking data...</div>
          </div>
        </div>
      </>
    );
  }

  if (!bookingData) {
    return (
      <>
        <Navbar/>
        <div className="flex h-screen bg-gray-100">
          <DashboardLayout />
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow my-20 flex justify-center items-center">
            <div>Booking not found</div>
          </div>
        </div>
      </>
    );
  }

  // Enhanced view for non-superusers (single page view)

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
          <div className="w-full max-w-4xl max-h-fit  mx-auto p-6 bg-white rounded shadow ">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Booking' : 'Booking Details'}
                </h1>
                <button
              onClick={toggleEdit}
              className={`flex items-center px-4 py-2 rounded ${isEditing ? 'bg-gray-200 text-gray-800' : 'bg-[#d9b683] text-white'}`}
                >
              {isEditing ? (
                <>
                  <FaArrowLeft className="mr-2" /> Cancel
                </>
              ) : (
                <>
                  <FaEdit className="mr-2" /> Edit
                </>
              )}
                </button>
            </div>

        {isEditing ? (
            <>
            <div className="flex items-center mb-8">
                <div onClick={()=>{setStep(1)}} className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-[#d9b683] text-white' : 'bg-gray-200'}`}>
                    {step === 1 ? <FaCheck /> : '1'}
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#d9b683]' : 'bg-gray-200'}`}></div>
                <div onClick={()=>{setStep(2)}} className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-[#d9b683] text-white' : step > 2 ? 'bg-[#d9b683] text-white' : 'bg-gray-200'}`}>
                    {step === 2 ? <FaCheck /> : '2'}
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {step === 1 ? 'Event Information' : 'Packages & Addons'}
            </h2>

          {/* {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
            )} */}

          {step === 1 ? (
            <form onSubmit={isEditing ? handleUpdateBooking : (e) => e.preventDefault()}>
              {user?.is_superuser && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="client">
                    <FaUser className="inline mr-2 text-[#d9b683]" />
                    Client
                  </label>
                 
                    <select
                      id="client"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      required
                    >
                      <option value="">Select a client</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.username}
                        </option>
                      ))}
                    </select>
                  
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="event_type">
                  <FiPackage className="inline mr-2 text-[#d9b683]" />
                  Event Type
                </label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    required
                  >
                    <option value="">Select event type</option>
                    <option value="White Wedding">White Wedding</option>
                    <option value="Traditional Marriage">Traditional Marriage</option>
                    <option value="Prewedding Shoot">Prewedding Shoot</option>
                    <option value="">Other</option>
                  </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="event_description">
                  Event Description
                </label>
                  <input
                    type="text"
                    id="event_description"
                    name="event_description"
                    value={formData.event_description || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    placeholder="Describe your event"
                  /></div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="wedding_date">
                  <FaCalendarAlt className="inline mr-2 text-[#d9b683]" />
                  Event Date
                </label>
              
                  <input
                    type="date"
                    id="wedding_date"
                    name="wedding_date"
                    value={formData.wedding_date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                  /></div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="location">
                  <FaMapMarkerAlt className="inline mr-2 text-[#d9b683]" />
                  Location
                </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    placeholder="Event venue address"
                    required
                  /></div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="additional_notes">
                  Additional Notes
                </label>
                  <textarea
                    id="additional_notes"
                    name="additional_notes"
                    value={formData.additional_notes}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    rows="3"
                    placeholder="Any special requirements or notes..."
                  /></div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={toggleEdit}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded flex items-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-6 rounded flex items-center"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'} <FaSave className="ml-2" />
                  </button>
                </div>
              )}

              {!isEditing && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-6 rounded flex items-center"
                  >
                    View Packages & Addons <FaArrowRight className="ml-2" />
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Packages</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {packages.map(pkg => {
                    const isSelected = selectedPackages.some(sp => sp.id === pkg.id);
                    return (
                      <div 
                        key={pkg.id} 
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected ? 
                            'border-[#d9b683] bg-[#f9f5ed]' : 
                            'border-gray-200 hover:border-gray-300'
                        } ${
                          isEditing ? 'cursor-pointer' : 'cursor-default'
                        }`}
                        onClick={() => isEditing && handlePackageSelect(pkg)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">{pkg.package_name}</h4>
                            <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
                            <p className="text-[#d9b683] font-bold mt-2">N{pkg.price.toLocaleString()}</p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center">
                              {isEditing && (
                                <button 
                                  type="button" 
                                  className="text-gray-500 hover:text-[#d9b683]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity('package', pkg.id, selectedPackages.find(sp => sp.id === pkg.id).quantity - 1);
                                  }}
                                >
                                  <FaMinus />
                                </button>
                              )}
                              <span className="mx-2 w-8 text-center">
                                {selectedPackages.find(sp => sp.id === pkg.id)?.quantity || 1}
                              </span>
                              {isEditing && (
                                <button 
                                  type="button" 
                                  className="text-gray-500 hover:text-[#d9b683]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity('package', pkg.id, selectedPackages.find(sp => sp.id === pkg.id).quantity + 1);
                                  }}
                                >
                                  <FaPlus />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Addons</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {addons?.map(addon => {
                    const isSelected = selectedAddons.some(sa => sa.id === addon.id);
                    return (
                      <div 
                        key={addon.id} 
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected ? 
                            'border-[#d9b683] bg-[#f9f5ed]' : 
                            'border-gray-200 hover:border-gray-300'
                        } ${
                          isEditing ? 'cursor-pointer' : 'cursor-default'
                        }`}
                        onClick={() => isEditing && handleAddonSelect(addon)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">{addon.name}</h4>
                            <p className="text-gray-600 text-sm mt-1">{addon.description}</p>
                            <p className="text-[#d9b683] font-bold mt-2">N{addon.price.toLocaleString()}</p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center">
                              {isEditing && (
                                <button 
                                  type="button" 
                                  className="text-gray-500 hover:text-[#d9b683]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity('addon', addon.id, selectedAddons.find(sa => sa.id === addon.id).quantity - 1);
                                  }}
                                >
                                  <FaMinus />
                                </button>
                              )}
                              <span className="mx-2 w-8 text-center">
                                {selectedAddons.find(sa => sa.id === addon.id)?.quantity || 1}
                              </span>
                              {isEditing && (
                                <button 
                                  type="button" 
                                  className="text-gray-500 hover:text-[#d9b683]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity('addon', addon.id, selectedAddons.find(sa => sa.id === addon.id).quantity + 1);
                                  }}
                                >
                                  <FaPlus />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

                          {isEditing && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Discount</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Discount Type</label>
                      <select
                        value='amount'
                        onChange={(e) => setDiscount({...discount, type: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      >
                        <option value="amount">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Amount (₦)
                        {/* {discount.type === 'amount' ? 'Amount (₦)' : 'Percentage (%)'} */}
                      </label>
                      <input
                        type="number" defaultValue={discount.price || 0}
                        // min="0"
                        // max={discount.type === 'percentage' ? 100 : undefined}
                        // value={discount.price}
                        onChange={(e) => setDiscount({...discount, price: parseFloat(e.target.value)||0})}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Description (Optional)</label>
                    <input
                      type="text"
                      value={discount.description}
                      onChange={(e) => setDiscount({...discount, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                      placeholder="e.g., Early bird discount"
                    />
                  </div>
                </div>
              </div>
            )}

              

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {selectedPackages.map(item => (
                    <div key={`pkg-${item.id}`} className="flex justify-between">
                      <span>{item.package_name} × {item.quantity}</span>
                      <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {selectedAddons.map(item => (
                    <div key={`addon-${item.id}`} className="flex justify-between">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}

                     
                        <div  className="flex justify-between">
                          <span className="text-gray-700">{discount.name}</span>
                          <span className="font-medium">-₦{(discount.price * discount.quantity).toLocaleString()}</span>
                        </div>
                    

                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 font-bold text-lg flex justify-between">
                  <span>Total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Information for Superusers */}
              {/* {console.log(payments)} */}
              {user?.is_superuser && payments.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {payments.map(payment => (
                      <div key={payment.id} className="flex justify-between">
                        <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                        <span>N{payment.amount_paid.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 font-bold text-lg flex justify-between">
                    <span>Total Paid</span>
                    <span>N{bookingData.total_payments_made.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Balance Due</span>
                    <span className={bookingData.amount_due > 0 ? 'text-red-600' : 'text-green-600'}>
                      N{bookingData.amount_due.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded flex items-center"
                >
                  <FaArrowLeft className="mr-2" /> Back to Details
                </button>
                
                {isEditing && (
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded flex items-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateBookingStep2}
                      className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-6 rounded flex items-center"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'} <FaSave className="ml-2" />
                    </button>
                  </div>
                )}
                
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/invoice/${id}`)}
                    className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-6 rounded flex items-center"
                  >
                    View Invoice <FaArrowRight className="ml-2" />
                  </button>
                )}
              </div>
            </div>
          )}</>







        
            ):(
                <>
                <div className="space-y-8">
              {/* Event Information Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
                  <FiPackage className="mr-2 text-[#d9b683]" />
                  Event Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Event Type</label>
                      <p className="text-gray-800 font-medium">{formData.event_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                      <p className="text-gray-800">{formData.event_description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Event Date</label>
                      <p className="text-gray-800 font-medium">
                        {formData.wedding_date ? new Date(formData.wedding_date).toLocaleDateString() : 'No date set'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                      <p className="text-gray-800">{formData.location || 'No location specified'}</p>
                    </div>
                  </div>
                </div>
                {formData.additional_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Additional Notes</label>
                    <p className="text-gray-800">{formData.additional_notes}</p>
                  </div>
                )}
              </div>

              {/* Packages & Addons Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Selected Services</h2>
                
                <div className="space-y-6">
                  {/* Packages Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Packages</h3>
                    {selectedPackages.length > 0 ? (
                      <div className="space-y-3">
                        {console.log(selectedPackages)}
                        {selectedPackages.map(item => (
                          <div key={`pkg-${item.id}`} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">{item.package_name}</h4>
                                <p className="text-gray-600 text-sm mt-1">{item.deliverables}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-600 text-sm">Qty: {item.quantity}</span>
                                <p className="text-[#d9b683] font-bold mt-1">N{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No packages selected</p>
                    )}
                  </div>

                  {/* Addons Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Addons</h3>
                    {selectedAddons.length > 0 ? (
                      <div className="space-y-3">
                        {selectedAddons.map(item => (
                          <div key={`addon-${item.id}`} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                <p className="text-gray-600 text-sm mt-1">{item.deliverables}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-600 text-sm">Qty: {item.quantity}</span>
                                <p className="text-[#d9b683] font-bold mt-1">N{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No addons selected</p>
                    )}
                  </div>

                  {/* Discount */}
                  
                    
                     {discount.price >0 &&(
                      <>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Discount</h3>
                      <div className="space-y-3">
                        
                          <div  className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800"></h4>
                                <p className="text-gray-600 text-sm mt-1">{discount.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-600 text-sm">Qty: {discount.quantity}</span>
                                <p className="text-[#d9b683] font-bold mt-1">-N{(discount.price * discount.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        
                      </div></>
                    )
                  }

                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Payment Summary</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Invoice Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Invoice Summary</h3>
                    <div className="space-y-2">
                      {selectedPackages.map(item => (
                        <div key={`pkg-sum-${item.id}`} className="flex justify-between">
                          <span className="text-gray-700">{item.package_name} × {item.quantity}</span>
                          <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      {selectedAddons.map(item => (
                        <div key={`addon-sum-${item.id}`} className="flex justify-between">
                          <span className="text-gray-700">{item.name} × {item.quantity}</span>
                          <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                     
                        {discount.price >0 &&<div  className="flex justify-between">
                          <span className="text-gray-700">{discount.name}</span>
                          <span className="font-medium">-₦{(discount.price * discount.quantity).toLocaleString()}</span>
                        </div>}
                      
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 font-bold text-lg flex justify-between">
                      <span>Total Amount</span>
                      <span>₦{bookingData.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Payment History</h3>
                    {payments.length > 0 ? (
                      <>
                        <div className="space-y-2 mb-3">
                          {payments.map(payment => (
                            <div key={payment.id} className="flex justify-between">
                              <span className="text-gray-700">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </span>
                              <span className="font-medium">N{(payment.amount_paid).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between font-medium">
                            <span>Total Paid</span>
                            <span>N{bookingData.total_payments_made.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg mt-2">
                            <span>Balance Due</span>
                            <span className={bookingData.amount_due> 0 ? 'text-red-600' : 'text-green-600'}>
                              N{bookingData.amount_due.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">No payments recorded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* View Invoice Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/invoice/${id}`)}
                  className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-6 rounded flex items-center transition-colors"
                >
                  View Full Invoice <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
                </>
            )}
            
            
          </div></div>
        </div>
      </>
    );
  }

  // Original two-step view for superusers
  


export default ViewEditBooking;