import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaArrowRight, FaArrowLeft, FaCheck, FaPlus, FaMinus, FaTrash, FaPercent } from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import { useUser } from '../services/UserContext';
import { fetchClientList, updateBookings } from '../services/Api';
import { fetchPackage } from '../services/Api';
import { fetchAddon } from '../services/Api';
import { fetchInvoiceItem } from '../services/Api';
import { postBookings } from '../services/Api';
import { postInvoiceItem } from '../services/Api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';
import { useNavigate } from 'react-router-dom';

const CreateBooking = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useUser()
  const [created, setCreated] =useState()
  const savedBooking = JSON.parse(localStorage.getItem('bookingData'));

  // Form data
  const [formData, setFormData] = useState({
    client: user?.is_superuser ? savedBooking?.client  : user?.id ||'',
    event_type: savedBooking?.event_type || '',
    event_description: savedBooking?.event_description ||'',
    event_dates: savedBooking?.event_dates || [{ date: '', date_location: '' }],
    additional_notes: savedBooking?.additional_notes||'',
    packages: [],
    addons: []
  });

  // Store booking data returned from step 1
  const [bookingData, setBookingData] = useState(null);

  // Invoice items
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [customPackages, setCustomPackages] = useState([]);
  const [newCustomPackage, setNewCustomPackage] = useState({
    description: '',
    deliverables: '',
    quantity: 1,
    price: ''
  });

  // Discount state
  const [discount, setDiscount] = useState({
    type: 'percentage', // 'percentage' or 'fixed'
    value: 0,
    description: ''
  });

  // Fetch users if admin
  useEffect(() => {
    if (user?.is_superuser) {
      const fetchClients = async () => {
      try {
        const data = await fetchClientList();
        setUsers(data);
      } catch (error) {
        setError(error.message)
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
        // console.log(packagesRes)
        setPackages(packagesRes);
        setAddons(addonsRes);
        
      } catch (error) {
        setError(error.message)
        console.error('Error fetching clients:', error);
      }
    };
    
    fetchPackages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePackageSelect = (pkg) => {
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
    setSelectedAddons(prev => {
      const exists = prev.find(item => item.id === addon.id);
      if (exists) {
        return prev.filter(item => item.id !== addon.id);
      } else {
        return [...prev, { ...addon, quantity: 1 }];
      }
    });
  };

  // Custom package functions
  const handleCustomPackageChange = (e) => {
    const { name, value } = e.target;
    setNewCustomPackage(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) : value 
    }));
  };

  const addCustomPackage = () => {
    if (newCustomPackage.description.trim() === '') {
      setError('Please enter a name for the custom package');
      return;
    }

    if (newCustomPackage.price <= 0) {
      setError('Please enter a valid price for the custom package');
      return;
    }

    const customPackage = {
      id: Date.now(), // Unique ID for the custom package
      description: newCustomPackage.description,
      deliverables: newCustomPackage.deliverables,
      quantity: newCustomPackage.quantity,
      price: newCustomPackage.price,
      isCustom: true
    };

    setCustomPackages(prev => [...prev, customPackage]);
    setNewCustomPackage({
      description: '',
      deliverables: '',
      quantity: 1,
      price: 0
    });
    setError(null);
  };

  const removeCustomPackage = (id) => {
    setCustomPackages(prev => prev.filter(item => item.id !== id));
  };

  const updateCustomPackageQuantity = (id, newQuantity) => {
    setCustomPackages(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const updateQuantity = (type, id, newQuantity) => {
    if (type === 'package') {
      setSelectedPackages(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
        )
      );
    } else if (type === 'addon') {
      setSelectedAddons(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
        )
      );
    }
  };

  // Discount functions
  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setDiscount(prev => ({ 
      ...prev, 
      [name]: name === 'value' ? parseFloat(value) : value 
    }));
  };

  const calculateDiscountAmount = (subtotal) => {
    if (discount.value <= 0) return 0;
    
    if (discount.type === 'percentage') {
      return (subtotal * discount.value) / 100;
    } else {
      return Math.min(discount.value, subtotal); // Don't allow discount more than subtotal
    }
  };

  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (savedBooking){
        
        console.log(savedBooking.id)
        const id = savedBooking.id
        const data = await updateBookings(id, formData)
        setFormData(prev => ({ ...prev, booking_id: data.id }));
        setStep(2)
      }
      else {
        console.log(formData)
      
        const data = await postBookings(formData)
        console.log(data)
    
        if (data) {
          setBookingData(data)
          console.log(data)
          setFormData(prev => ({ ...prev, booking_id: data.id }));
          setStep(2);
          setCreated(true)
          localStorage.setItem('bookingData', JSON.stringify(data));
          // localStorage.setItem('bookingInfo', data.id)

        } else {
          setError(data.message || 'Failed to create booking');
        }
    }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create invoice items for packages, addons, and custom packages
      localStorage.removeItem('bookingData')
      
      // Create all invoice items first
      await Promise.all([
        ...selectedPackages.map(item => 
          postInvoiceItem({
            invoice: bookingData.id,
            item_type: 'package',
            package: item.id,
            description: item.package_name,
            deliverables: item.deliverables,
            quantity: item.quantity,
            price: item.price,
            is_taxable: false
          })
        ),
        ...selectedAddons.map(item => 
          postInvoiceItem({
            invoice: bookingData.id,
            item_type: 'addon',
            addon: item.id,
            description: item.name,
            deliverables: item.description,
            quantity: item.quantity,
            price: item.price,
            is_taxable: true
          })
        ),
        ...customPackages.map(item => 
          postInvoiceItem({
            invoice: bookingData.id,
            item_type: 'other',
            description: item.description,
            deliverables: item.deliverables,
            quantity: item.quantity,
            price: item.price,
            is_taxable: true
          })
        ),
      ]);

      // Add discount as a separate invoice item if applied
      if (discount.value > 0) {
        const subtotal = [...selectedPackages, ...selectedAddons, ...customPackages].reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );
        const discountAmount = calculateDiscountAmount(subtotal);
        
        if (discountAmount > 0) {
          await postInvoiceItem({
            invoice: bookingData.id,
            item_type: 'discount',
            description: discount.description || `Discount applied`,
            deliverables: discount.type === 'percentage' ? `${discount.value}% discount` : `₦${discount.value.toLocaleString()} discount`,
            quantity: 1,
            price: discountAmount, // Negative price for discount
            is_taxable: false,
          });
        }
      }
      
      // Redirect or show success message
      console.log(selectedPackages)
      console.log(selectedAddons)
      console.log(customPackages)
      // window.location.href = `/dashboard/invoice/${formData.booking_id}`;
      navigate(`/dashboard/invoice/${formData.booking_id}`)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      
      setCreated(false)
    }
  };

  const subtotalAmount = [...selectedPackages, ...selectedAddons, ...customPackages].reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );

  const discountAmount = calculateDiscountAmount(subtotalAmount);
  const totalAmount = subtotalAmount - discountAmount;

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
    <div className="w-full max-w-4xl max-h-fit overflow-scroll mx-auto p-6 bg-white rounded shadow my-20">
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-[#d9b683] text-white' : 'bg-gray-200'}`}>
          {step === 1 ? <FaCheck /> : '1'}
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#d9b683]' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-[#d9b683] text-white' : step > 2 ? 'bg-[#d9b683] text-white' : 'bg-gray-200'}`}>
          {step === 2 ? <FaCheck /> : '2'}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {step === 1 ? 'Event Information' : 'Select Packages & Addons'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSubmitStep1}>
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
              <option value="Wedding">Wedding</option>
              <option value="Traditional Marriage">Traditional Marriage</option>
              <option value="Prewedding Shoot">Prewedding Shoot</option>
              <option value="Burial">Burial</option>
              <option value="Birthday">Birthday</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* {formData.event_type =='' && ( */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="event_description">
                Event Description
              </label>
              <input
                type="text"
                id="event_description"
                name="event_description"
                value={formData.event_description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                placeholder="Describe your event"
              />
            </div>
          {/* )} */}

{/* Multiple Event Dates + Locations */}
<div className="mb-6">
  <label className="block text-gray-700 text-sm font-medium mb-3">
    <FaCalendarAlt className="inline mr-2 text-[#d9b683]" />
    Event Dates & Locations
  </label>

  <div className="space-y-3">
    {formData.event_dates?.map((eventDate, index) => (
      <div
        key={index}
        className="flex flex-col md:flex-row items-center gap-3 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        {/* Date Input */}
        <div className="flex-1 w-full">
          <input
            type="date"
            value={eventDate.date}
            onChange={(e) => {
              const updated = [...formData.event_dates];
              updated[index].date = e.target.value;
              setFormData((prev) => ({ ...prev, event_dates: updated }));
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b683] focus:border-transparent transition-colors duration-200 bg-white"
            required
          />
        </div>

        {/* Location Input */}
        <div className="flex-1 w-full">
          <input
            type="text"
            value={eventDate.date_location || ""}
            placeholder="Enter location..."
            onChange={(e) => {
              const updated = [...formData.event_dates];
              updated[index].date_location = e.target.value;
              setFormData((prev) => ({ ...prev, event_dates: updated }));
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b683] focus:border-transparent transition-colors duration-200 placeholder-gray-400"
            required
          />
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => {
            const updatedDates = formData.event_dates.filter((_, i) => i !== index);
            setFormData((prev) => ({ ...prev, event_dates: updatedDates }));
          }}
          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
          title="Remove date"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>
    ))}
  </div>

  {/* Add Date Button */}
  <button
    type="button"
    onClick={() =>
      setFormData((prev) => ({
        ...prev,
        event_dates: [...prev.event_dates, { date: "", location: "" }],
      }))
    }
    className="mt-4 bg-[#d9b683] hover:bg-[#c9a673] text-white font-semibold py-2 px-6 rounded-sm flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
  >
    <FaPlus className="mr-2" /> Add Date & Location
  </button>
</div>

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
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-6 rounded flex items-center"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue'} <FaArrowRight className="ml-2" />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitStep2}>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Packages</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {packages.map(pkg => (
                <div 
                  key={pkg.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPackages.some(sp => sp.id === pkg.id) ? 'border-[#d9b683] bg-[#f9f5ed]' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{pkg.package_name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
                      <p className="text-[#d9b683] font-bold mt-2">N{pkg.price.toLocaleString()}</p>
                    </div>
                    {selectedPackages.some(sp => sp.id === pkg.id) && (
                      <div className="flex items-center">
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
                        <span className="mx-2 w-8 text-center">
                          {selectedPackages.find(sp => sp.id === pkg.id)?.quantity || 1}
                        </span>
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
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Addons</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {addons?.map(addon => (
                <div 
                  key={addon.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddons.some(sa => sa.id === addon.id) ? 'border-[#d9b683] bg-[#f9f5ed]' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handleAddonSelect(addon)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{addon.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{addon.description}</p>
                      <p className="text-[#d9b683] font-bold mt-2">N{addon.price.toLocaleString()}</p>
                    </div>
                    {selectedAddons.some(sa => sa.id === addon.id) && (
                      <div className="flex items-center">
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
                        <span className="mx-2 w-8 text-center">
                          {selectedAddons.find(sa => sa.id === addon.id)?.quantity || 1}
                        </span>
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
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Packages Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Custom Packages</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Package </label>
                  <input
                    type="text"
                    name="description"
                    value={newCustomPackage.description}
                    onChange={handleCustomPackageChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    placeholder="Package name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    id="deliverables"
                    name="deliverables"
                    value={newCustomPackage.deliverables}
                    onChange={handleCustomPackageChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    placeholder="Package description">
                  </textarea>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center">
                    <button 
                      type="button" 
                      className="text-gray-500 hover:text-[#d9b683] p-2"
                      onClick={() => setNewCustomPackage(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      name="quantity"
                      value={newCustomPackage.quantity}
                      onChange={handleCustomPackageChange}
                      className="w-16 text-center border border-gray-300 rounded mx-2 p-2"
                      min="1"
                    />
                    <button 
                      type="button" 
                      className="text-gray-500 hover:text-[#d9b683] p-2"
                      onClick={() => setNewCustomPackage(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Price (₦)</label>
                  <input
                    type="number"
                    name="price"
                    value={newCustomPackage.price}
                    onChange={handleCustomPackageChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addCustomPackage}
                className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <FaPlus className="mr-2" /> Add Custom Package
              </button>
            </div>

            {/* Display added custom packages */}
            {customPackages.length > 0 && (
              <div className="space-y-3">
                {customPackages.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{item.description}</h4>
                      <p className="text-gray-600 text-sm mt-1 truncate max-w-20 sm:max-w-xs">{item.deliverables}</p>
                      <p className="text-[#d9b683] font-bold">N{item.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <button 
                          type="button" 
                          className="text-gray-500 hover:text-[#d9b683]"
                          onClick={() => updateCustomPackageQuantity(item.id, item.quantity - 1)}
                        >
                          <FaMinus />
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button 
                          type="button" 
                          className="text-gray-500 hover:text-[#d9b683]"
                          onClick={() => updateCustomPackageQuantity(item.id, item.quantity + 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <button 
                        type="button" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeCustomPackage(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount Section - Only for Superusers */}
          {user?.is_superuser && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Apply Discount</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Discount Type</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="percentage"
                          checked={discount.type === 'percentage'}
                          onChange={handleDiscountChange}
                          className="mr-2"
                        />
                        Percentage (%)
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="fixed"
                          checked={discount.type === 'fixed'}
                          onChange={handleDiscountChange}
                          className="mr-2"
                        />
                        Fixed Amount
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      {discount.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₦)'}
                    </label>
                    <div className="flex items-center">
                      <FaPercent className="text-gray-400 mr-2" />
                      <input
                        type="number"
                        name="value"
                        value={discount.value}
                        onChange={handleDiscountChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                        placeholder={discount.type === 'percentage' ? '0-100' : '0.00'}
                        min="0"
                        max={discount.type === 'percentage' ? '100' : undefined}
                        step={discount.type === 'percentage' ? '1' : '0.01'}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Discount Description (Optional)</label>
                  <input
                    type="text"
                    name="description"
                    value={discount.description}
                    onChange={handleDiscountChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                    placeholder="e.g., Special promotion, Loyalty discount, etc."
                  />
                </div>
                {discount.value > 0 && (
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      Discount will reduce the total by: <strong>
                        {discount.type === 'percentage' 
                          ? `${discount.value}% (₦${calculateDiscountAmount(subtotalAmount).toLocaleString()})`
                          : `₦${discount.value.toLocaleString()}`
                        }
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {selectedPackages.map(item => (
                <div key={`pkg-${item.id}`} className="flex justify-between">
                  <span>{item.package_name} × {item.quantity}</span>
                  <span>N{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {selectedAddons.map(item => (
                <div key={`addon-${item.id}`} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>N{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {customPackages.map(item => (
                <div key={`custom-${item.id}`} className="flex justify-between">
                  <span>{item.description} × {item.quantity}</span>
                  <span>N{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            {/* Subtotal */}
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
              <span>Subtotal</span>
              <span>N{subtotalAmount.toLocaleString()}</span>
            </div>
            
            {/* Discount */}
            {discount.value > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount {discount.type === 'percentage' ? `(${discount.value}%)` : ''}</span>
                <span>-N{discountAmount.toLocaleString()}</span>
              </div>
            )}
            
            {/* Total */}
            <div className="border-t border-gray-200 mt-3 pt-3 font-bold text-lg flex justify-between">
              <span>Total</span>
              <span>N{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
            <button
              type="submit"
              className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-6 rounded flex items-center"
              disabled={loading || (selectedPackages.length === 0 && selectedAddons.length === 0 && customPackages.length === 0)}
            >
              {loading ? 'Processing...' : 'Complete Booking'} <FaCheck className="ml-2" />
            </button>
          </div>
        </form>
      )}
    </div></div></div>
    </>
  );
};

export default CreateBooking;