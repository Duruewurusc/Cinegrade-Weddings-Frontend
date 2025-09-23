import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaArrowRight, FaArrowLeft, FaCheck, FaPlus, FaMinus } from 'react-icons/fa';
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
    wedding_date: savedBooking?.wedding_date || '',
    location: savedBooking?.location ||'',
    additional_notes: savedBooking?.additional_notes||''
  });

    // Store booking data returned from step 1
  const [bookingData, setBookingData] = useState(null);

  // Invoice items
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

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

  const updateQuantity = (type, id, newQuantity) => {
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
      
        const data = await postBookings(formData)
    
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
      // Create invoice items for packages
      localStorage.removeItem('bookingData')
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
      ]);
      
      // Redirect or show success message
      console.log(selectedPackages)
      console.log(selectedAddons)
      // window.location.href = `/dashboard/invoice/${formData.booking_id}`;
      navigate(`/dashboard/invoice/${formData.booking_id}`)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      
      setCreated(false)
    }
  };

  const totalAmount = [...selectedPackages, ...selectedAddons].reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );

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
              <option value="White Wedding">White Wedding</option>
              <option value="Traditional Marriage">Traditional Marriage</option>
              <option value="Prewedding Shoot">Prewedding Shoot</option>
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
              // required
            />
          </div>

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
            />
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
            </div>
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
              disabled={loading || (selectedPackages.length === 0 && selectedAddons.length === 0)}
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