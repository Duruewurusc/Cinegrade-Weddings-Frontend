import { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaTrash, FaMapMarkerAlt, FaUser, FaArrowRight,
  FaArrowLeft, FaCheck, FaPlus, FaMinus, FaEdit, FaSave, FaPercent
} from 'react-icons/fa';
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
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [existingInvoiceItems, setExistingInvoiceItems] = useState([]);
  const [payments, setPayments] = useState([]);

  // selections
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  // customPackages contains objects with shape:
  // { invoice_item_id?: number, description, deliverables, quantity, price }
  const [customPackages, setCustomPackages] = useState([]);
  const [newCustomPackage, setNewCustomPackage] = useState({
    description: '',
    deliverables: '',
    quantity: 1,
    price: 0
  });

  const [discount, setDiscount] = useState({
    id: null,
    description: '',
    price: 0,
    quantity: 1,
    type: 'amount'
  });

  // form data
  const [formData, setFormData] = useState({
    client: user?.is_superuser ? '' : user?.id,
    event_type: '',
    event_description: '',
    event_dates: [{ date: '', date_location: '' }],
    additional_notes: ''
  });

    // Go back to previous page
  const handleBack = () => {
    navigate(-1); // This goes to the previous page in history
  };


  // Helper: format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Fetch booking + invoice items + payments
  useEffect(() => {
    const fetchBookingData = async () => {
      setLoading(true);
      try {
        const booking = await fetchBookings(id);
        setBookingData(booking);

        // Set formData: prefer event_dates if present
        setFormData(prev => ({
          ...prev,
          client: booking.client,
          event_type: booking.event_type,
          event_description: booking.event_description,
          event_dates: booking.event_dates && booking.event_dates.length > 0 ? booking.event_dates : [{ date: booking.wedding_date || '' }],
          location: booking.event_dates && booking.event_dates.length > 0 ? booking.date_location : [{ date: booking.location || '' }],
          additional_notes: booking.additional_notes
        }));

        // invoice items
        const invoiceItems = await fetchInvoiceItem();
        const items = invoiceItems.filter(it => it.invoice === booking.id);
        setExistingInvoiceItems(items);

        // map packages
        const packageItems = items.filter(it => it.item_type === 'package').map(it => ({
          invoice_item_id: it.id,
          id: it.package,
          package_name: it.description,
          deliverables: it.deliverables,
          price: parseFloat(it.price) || 0,
          quantity: it.quantity || 1
        }));
        setSelectedPackages(packageItems);

        // map addons
        const addonItems = items.filter(it => it.item_type === 'addon').map(it => ({
          invoice_item_id: it.id,
          id: it.addon,
          name: it.description,
          deliverables: it.deliverables,
          price: parseFloat(it.price) || 0,
          quantity: it.quantity || 1
        }));
        setSelectedAddons(addonItems);

        // map custom (other)
        const customItems = items.filter(it => it.item_type === 'other').map(it => ({
          invoice_item_id: it.id,
          description: it.description,
          deliverables: it.deliverables,
          price: parseFloat(it.price) || 0,
          quantity: it.quantity || 1
        }));
        setCustomPackages(customItems);

        // map discount (assume single discount item)
        const discountItems = items.filter(it => it.item_type === 'discount');
        if (discountItems.length > 0) {
          const d = discountItems[0];
          setDiscount({
            id: d.id,
            description: d.description || '',
            price: Math.abs(parseFloat(d.price) || 0), // stored as positive number (your app used positive)
            quantity: d.quantity || 1,
            type: 'amount'
          });
        } else {
          setDiscount(prev => ({ ...prev, price: 0 }));
        }

        // payments
        const paymentList = await fetchPayments();
        const paymentData = paymentList.filter(p => p.invoice.id === booking.id);
        setPayments(paymentData);

      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch packages, addons, and clients (if admin)
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [pkgs, ads] = await Promise.all([fetchPackage(), fetchAddon()]);
        setPackages(pkgs);
        setAddons(ads);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load packages/addons');
      }
    };
    loadLookups();

    if (user?.is_superuser) {
      (async () => {
        try {
          const u = await fetchClientList();
          setUsers(u);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [user?.is_superuser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // packages / addons selection (only while editing)
  const handlePackageSelect = (pkg) => {
    if (!isEditing) return;
    setSelectedPackages(prev => {
      const exists = prev.find(p => p.id === pkg.id);
      if (exists) return prev.filter(p => p.id !== pkg.id);
      return [...prev, { invoice_item_id: null, id: pkg.id, package_name: pkg.package_name, deliverables: pkg.description, price: parseFloat(pkg.price) || 0, quantity: 1 }];
    });
  };

  const handleAddonSelect = (addon) => {
    if (!isEditing) return;
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) return prev.filter(a => a.id !== addon.id);
      return [...prev, { invoice_item_id: null, id: addon.id, name: addon.name, deliverables: addon.description, price: parseFloat(addon.price) || 0, quantity: 1 }];
    });
  };

  const updateQuantity = (type, id, newQuantity) => {
    if (!isEditing) return;
    const q = Math.max(1, newQuantity || 1);
    if (type === 'package') {
      setSelectedPackages(prev => prev.map(it => it.id === id ? { ...it, quantity: q } : it));
    } else {
      setSelectedAddons(prev => prev.map(it => it.id === id ? { ...it, quantity: q } : it));
    }
  };

  // Custom packages: add, edit inline, remove
  const handleNewCustomChange = (e) => {
    const { name, value } = e.target;
    setNewCustomPackage(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const addCustomPackage = () => {
    if (!isEditing) return;
    if (!newCustomPackage.description.trim()) {
      setError('Please enter a name for the custom package');
      return;
    }
    if (!newCustomPackage.price || newCustomPackage.price <= 0) {
      setError('Please enter a valid price for the custom package');
      return;
    }

    const cp = {
      invoice_item_id: null,
      description: newCustomPackage.description,
      deliverables: newCustomPackage.deliverables,
      quantity: newCustomPackage.quantity || 1,
      price: parseFloat(newCustomPackage.price) || 0
    };
    setCustomPackages(prev => [...prev, cp]);
    setNewCustomPackage({ description: '', deliverables: '', quantity: 1, price: 0 });
    setError(null);
  };

  const updateCustomPackageField = (invoice_item_idOrIndex, field, value) => {
    // invoice_item_idOrIndex can be invoice_item_id (number) for persisted items or index (number) if not persisted.
    setCustomPackages(prev => prev.map((it, idx) => {
      const matches = (typeof invoice_item_idOrIndex === 'number' && it.invoice_item_id === invoice_item_idOrIndex) || (typeof invoice_item_idOrIndex === 'string' && it.invoice_item_id === Number(invoice_item_idOrIndex)) || (typeof invoice_item_idOrIndex === 'object' ? false : (it.invoice_item_id == null && idx === invoice_item_idOrIndex));
      if (!matches) return it;
      const newVal = (field === 'quantity' || field === 'price') ? (value === '' ? '' : parseFloat(value)) : value;
      return { ...it, [field]: newVal };
    }));
  };

  const removeCustomPackage = (invoice_item_idOrIndex) => {
    if (!isEditing) return;
    setCustomPackages(prev => prev.filter((it, idx) => {
      const matches = (typeof invoice_item_idOrIndex === 'number' && it.invoice_item_id === invoice_item_idOrIndex) || (typeof invoice_item_idOrIndex === 'string' && it.invoice_item_id === Number(invoice_item_idOrIndex)) || (it.invoice_item_id == null && idx === invoice_item_idOrIndex);
      return !matches;
    }));
  };

  // Toggle editing mode
  const toggleEdit = () => {
    const willCancel = isEditing;
    if (willCancel && bookingData) {
      // reset values from bookingData & existingInvoiceItems on cancel
      setFormData({
        client: bookingData.client,
        event_type: bookingData.event_type,
        event_description: bookingData.event_description,
        event_dates: bookingData.event_dates && bookingData.event_dates.length > 0 ? bookingData.event_dates : [{ date: bookingData.wedding_date || '' }],
        location: bookingData.location,
        additional_notes: bookingData.additional_notes
      });
      // Restore invoice items from existingInvoiceItems
      const pkgItems = existingInvoiceItems.filter(it => it.item_type === 'package').map(it => ({
        invoice_item_id: it.id,
        id: it.package,
        package_name: it.description,
        deliverables: it.deliverables,
        price: parseFloat(it.price) || 0,
        quantity: it.quantity || 1
      }));
      const adItems = existingInvoiceItems.filter(it => it.item_type === 'addon').map(it => ({
        invoice_item_id: it.id,
        id: it.addon,
        name: it.description,
        deliverables: it.deliverables,
        price: parseFloat(it.price) || 0,
        quantity: it.quantity || 1
      }));
      const custItems = existingInvoiceItems.filter(it => it.item_type === 'other').map(it => ({
        invoice_item_id: it.id,
        description: it.description,
        deliverables: it.deliverables,
        price: parseFloat(it.price) || 0,
        quantity: it.quantity || 1
      }));
      const discountItems = existingInvoiceItems.filter(it => it.item_type === 'discount');
      let disc = { id: null, description: '', price: 0, quantity: 1, type: 'amount' };
      if (discountItems.length > 0) {
        const d = discountItems[0];
        disc = { id: d.id, description: d.description || '', price: Math.abs(parseFloat(d.price) || 0), quantity: d.quantity || 1, type: 'amount' };
      }

      setSelectedPackages(pkgItems);
      setSelectedAddons(adItems);
      setCustomPackages(custItems);
      setDiscount(disc);
    }
    setIsEditing(!isEditing);
  };

  // Update booking (step 1)
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBookings(id, formData);
      // stay on editing view but switch to step 2 (packages) for convenience
      setStep(2);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  // Save step 2 (packages/addons/custom/discount)
  const handleUpdateBookingStep2 = async (e) => {
    e && e.preventDefault();
    if (!isEditing) return;
    setLoading(true);
    try {
      // Build unified list of current invoice items with possible invoice_item_id
      const currentItems = [
        ...selectedPackages.map(sp => ({
          invoice_item_id: sp.invoice_item_id || null,
          item_type: 'package',
          package: sp.id,
          description: sp.package_name,
          deliverables: sp.deliverables || '',
          quantity: sp.quantity,
          price: sp.price,
          is_taxable: false
        })),
        ...selectedAddons.map(sa => ({
          invoice_item_id: sa.invoice_item_id || null,
          item_type: 'addon',
          addon: sa.id,
          description: sa.name,
          deliverables: sa.deliverables || '',
          quantity: sa.quantity,
          price: sa.price,
          is_taxable: true
        })),
        ...customPackages.map(cp => ({
          invoice_item_id: cp.invoice_item_id || null,
          item_type: 'other',
          description: cp.description,
          deliverables: cp.deliverables || '',
          quantity: cp.quantity,
          price: cp.price,
          is_taxable: true
        })),
        // discount (if any)
        ...(discount && discount.price > 0 ? [{
          invoice_item_id: discount.id || null,
          item_type: 'discount',
          description: discount.description || 'Discount',
          deliverables: discount.type === 'amount' ? `₦${discount.price}` : `${discount.price}%`,
          quantity: 1,
          price: discount.price * 1, // store discount as negative if your backend expects negative
          is_taxable: false,
          is_discount: true
        }] : [])
      ];

      // Determine existing invoice item IDs from existingInvoiceItems
      const existingById = {};
      existingInvoiceItems.forEach(it => { existingById[it.id] = it; });

      // Items to add: those without invoice_item_id
      const itemsToAdd = currentItems.filter(it => !it.invoice_item_id);

      // Items to update: those with invoice_item_id but changed (compare with existingInvoiceItems)
      const itemsToUpdate = currentItems.filter(it => {
        if (!it.invoice_item_id) return false;
        const existing = existingById[it.invoice_item_id];
        if (!existing) return true; // not found, update as fallback
        // Compare fields: quantity, price, description/deliverables
        const priceEq = parseFloat(existing.price || 0) === parseFloat(it.price || 0);
        const qtyEq = parseInt(existing.quantity || 0, 10) === parseInt(it.quantity || 0, 10);
        const descEq = (existing.description || '') === (it.description || '');
        const delEq = (existing.deliverables || '') === (it.deliverables || '');
        // also check item_type and package/addon id fields
        const typeEq = existing.item_type === it.item_type;
        const refEq = ((it.item_type === 'package' && existing.package === it.package) ||
                      (it.item_type === 'addon' && existing.addon === it.addon) ||
                      (it.item_type === 'other') ||
                      (it.item_type === 'discount'));
        return !(priceEq && qtyEq && descEq && delEq && typeEq && refEq);
      });

      // Items to delete: existing invoice items that are not represented in currentItems
      const currentIds = currentItems.filter(it => it.invoice_item_id).map(it => it.invoice_item_id);
      const itemsToDelete = existingInvoiceItems.filter(ei => {
        // keep booking-level metadata items (payments etc.) only consider invoice items for this invoice
        // delete if ei.id is not in currentIds AND ei.item_type is one of the managed types
        const managedTypes = ['package', 'addon', 'other', 'discount'];
        return managedTypes.includes(ei.item_type) && !currentIds.includes(ei.id);
      });

      // Execute create/update/delete
      // Create
      await Promise.all(itemsToAdd.map(item => {
        const payload = { ...item, invoice: id };
        // normalize payload keys for backend: package/addon fields may need to exist only when required
        return postInvoiceItem(payload);
      }));

      // Update
      await Promise.all(itemsToUpdate.map(item => {
        const itemId = item.invoice_item_id;
        const payload = { ...item };
        delete payload.invoice_item_id;
        // include invoice id if backend needs it
        payload.invoice = id;
        return updateInvoiceItem(itemId, payload);
      }));

      // Delete
      await Promise.all(itemsToDelete.map(it => deleteInvoiceItem(it.id)));

      // refresh data
      const updatedBooking = await fetchBookings(id);
      setBookingData(updatedBooking);

      const invoiceItems = await fetchInvoiceItem();
      const items = invoiceItems.filter(it => it.invoice === updatedBooking.id);
      setExistingInvoiceItems(items);

      // Remap selections from saved invoice items to keep invoice_item_id populated
      const pkgItems = items.filter(it => it.item_type === 'package').map(it => ({
        invoice_item_id: it.id,
        id: it.package,
        package_name: it.description,
        deliverables: it.deliverables,
        price: parseFloat(it.price) || 0,
        quantity: it.quantity || 1
      }));
      const adItems = items.filter(it => it.item_type === 'addon').map(it => ({
        invoice_item_id: it.id,
        id: it.addon,
        name: it.description,
        deliverables: it.deliverables,
        price: parseFloat(it.price) || 0,
        quantity: it.quantity || 1
      }));
      const custItems = items.filter(it => it.item_type === 'other').map(it => ({
        invoice_item_id: it.id,
        description: it.description,
        deliverables: it.deliverables,
        price: parseFloat(it.price) || 0,
        quantity: it.quantity || 1
      }));
      setSelectedPackages(pkgItems);
      setSelectedAddons(adItems);
      setCustomPackages(custItems);

      // discount
      const discountItems = items.filter(it => it.item_type === 'discount');
      if (discountItems.length > 0) {
        const d = discountItems[0];
        setDiscount({
          id: d.id,
          description: d.description || '',
          price: Math.abs(parseFloat(d.price) || 0),
          quantity: d.quantity || 1,
          type: 'amount'
        });
      } else {
        setDiscount({ id: null, description: '', price: 0, quantity: 1, type: 'amount' });
      }

      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save invoice items');
    } finally {
      setLoading(false);
    }
  };

  // computed totals
  const subtotalAmount = [
    ...selectedPackages,
    ...selectedAddons,
    ...customPackages
  ].reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity || 1, 10))), 0);

  const discountAmount = discount.price ? (parseFloat(discount.price) || 0) : 0;
  const totalAmount = subtotalAmount - discountAmount;

  if (loading && !bookingData) {
    return (
      <>
        <Navbar />
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
        <Navbar />
        <div className="flex h-screen bg-gray-100">
          <DashboardLayout />
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow my-20 flex justify-center items-center">
            <div>Booking not found</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-gray-100">
        <div className="fixed h-screen">
          <DashboardLayout />
        </div>

        <div
          className="flex-1 md:ml-64 p-4 overflow-y-auto"
          style={{
            height: 'calc(100vh - 4rem)',
            width: '100%'
          }}
        >
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow my-6">
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
                  <div onClick={() => setStep(1)} className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-[#d9b683] text-white' : 'bg-gray-200'}`}>
                    {step === 1 ? <FaCheck /> : '1'}
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#d9b683]' : 'bg-gray-200'}`}></div>
                  <div onClick={() => setStep(2)} className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-[#d9b683] text-white' : 'bg-gray-200'}`}>
                    {step === 2 ? <FaCheck /> : '2'}
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  {step === 1 ? 'Event Information' : 'Packages & Addons'}
                </h2>

                {step === 1 ? (
                  <form onSubmit={handleUpdateBooking}>
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
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} {u.username}
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
                      >
                        <option value="">Select event type</option>
                        <option value="White Wedding">White Wedding</option>
                        <option value="Traditional Marriage">Traditional Marriage</option>
                        <option value="Prewedding Shoot">Prewedding Shoot</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Other">Other</option>
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
                      />
                    </div>

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
                          className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#d9b683] focus:border-transparent transition-colors duration-200 bg-white"
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
                          className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#d9b683] focus:border-transparent transition-colors duration-200 placeholder-gray-400"
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
                      event_dates: [...prev.event_dates, { date: "", date_location: "" }],
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
                      />
                    </div>

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
                  </form>
                ) : (
                  // STEP 2: packages & addons UI (editing)
                  <div>
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Packages</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {packages.map(pkg => {
                          const isSelected = selectedPackages.some(sp => sp.id === pkg.id);
                          return (
                            <div
                              key={pkg.id}
                              className={`border rounded-lg p-4 transition-all ${isSelected ? 'border-[#d9b683] bg-[#f9f5ed]' : 'border-gray-200 hover:border-gray-300'} ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                              onClick={() => isEditing && handlePackageSelect(pkg)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-800">{pkg.package_name}</h4>
                                  <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
                                  <p className="text-[#d9b683] font-bold mt-2">N{Number(pkg.price).toLocaleString()}</p>
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
                                    <span className="mx-2 w-8 text-center">{selectedPackages.find(sp => sp.id === pkg.id)?.quantity || 1}</span>
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
                        {addons.map(addon => {
                          const isSelected = selectedAddons.some(sa => sa.id === addon.id);
                          return (
                            <div
                              key={addon.id}
                              className={`border rounded-lg p-4 transition-all ${isSelected ? 'border-[#d9b683] bg-[#f9f5ed]' : 'border-gray-200 hover:border-gray-300'} ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                              onClick={() => isEditing && handleAddonSelect(addon)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-800">{addon.name}</h4>
                                  <p className="text-gray-600 text-sm mt-1">{addon.description}</p>
                                  <p className="text-[#d9b683] font-bold mt-2">N{Number(addon.price).toLocaleString()}</p>
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
                                    <span className="mx-2 w-8 text-center">{selectedAddons.find(sa => sa.id === addon.id)?.quantity || 1}</span>
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

                    {/* Custom packages (add & edit) */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Custom Packages</h3>

                      {/* New custom package form */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-gray-700 mb-2">Package</label>
                            <input
                              type="text"
                              name="description"
                              value={newCustomPackage.description}
                              onChange={handleNewCustomChange}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                              placeholder="Package name"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-2">Description</label>
                            <textarea
                              name="deliverables"
                              value={newCustomPackage.deliverables}
                              onChange={handleNewCustomChange}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                              placeholder="Package description"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-2">Quantity</label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                className="text-gray-500 hover:text-[#d9b683] p-2"
                                onClick={() => setNewCustomPackage(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) - 1) }))}
                              >
                                <FaMinus />
                              </button>
                              <input
                                type="number"
                                name="quantity"
                                value={newCustomPackage.quantity}
                                onChange={handleNewCustomChange}
                                className="w-16 text-center border border-gray-300 rounded mx-2 p-2"
                                min="1"
                              />
                              <button
                                type="button"
                                className="text-gray-500 hover:text-[#d9b683] p-2"
                                onClick={() => setNewCustomPackage(prev => ({ ...prev, quantity: (prev.quantity || 1) + 1 }))}
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
                              onChange={handleNewCustomChange}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={addCustomPackage}
                            className="bg-[#d9b683] hover:bg-[#c9a673] text-white font-bold py-2 px-4 rounded flex items-center"
                          >
                            <FaPlus className="mr-2" /> Add Custom Package
                          </button>
                        </div>
                      </div>

                      {/* Existing custom packages (editable rows) */}
                      {customPackages.length > 0 && (
                        <div className="space-y-3">
                          {customPackages.map((cp, idx) => (
                            <div key={cp.invoice_item_id ?? `new-${idx}`} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start">
                              <div className="w-full md:w-2/3">
                                <input
                                  type="text"
                                  value={cp.description}
                                  onChange={(e) => updateCustomPackageField(cp.invoice_item_id ?? idx, 'description', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded mb-2"
                                  placeholder="Package name"
                                  disabled={!isEditing}
                                />
                                <textarea
                                  value={cp.deliverables}
                                  onChange={(e) => updateCustomPackageField(cp.invoice_item_id ?? idx, 'deliverables', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded mb-2"
                                  placeholder="Deliverables / description"
                                />
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      className="text-gray-500 hover:text-[#d9b683] p-2"
                                      onClick={() => updateCustomPackageField(cp.invoice_item_id ?? idx, 'quantity', Math.max(1, (cp.quantity || 1) - 1))}
                                    >
                                      <FaMinus />
                                    </button>
                                    <input
                                      type="number"
                                      value={cp.quantity}
                                      onChange={(e) => updateCustomPackageField(cp.invoice_item_id ?? idx, 'quantity', e.target.value)}
                                      className="w-20 text-center border border-gray-300 rounded mx-2 p-2"
                                      min="1"
                                    />
                                    <button
                                      type="button"
                                      className="text-gray-500 hover:text-[#d9b683] p-2"
                                      onClick={() => updateCustomPackageField(cp.invoice_item_id ?? idx, 'quantity', (cp.quantity || 1) + 1)}
                                    >
                                      <FaPlus />
                                    </button>
                                  </div>

                                  <div className="flex items-center">
                                    <label className="mr-2 text-sm">Price (₦)</label>
                                    <input
                                      type="number"
                                      value={cp.price}
                                      onChange={(e) => updateCustomPackageField(cp.invoice_item_id ?? idx, 'price', e.target.value)}
                                      className="w-32 p-2 border border-gray-300 rounded"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 md:mt-0 md:ml-4 flex items-start">
                                <button
                                  type="button"
                                  onClick={() => removeCustomPackage(cp.invoice_item_id ?? idx)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Discount for superusers */}
                    {user?.is_superuser && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Discount</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-gray-700 mb-2">Discount Type</label>
                              <select
                                value={discount.type}
                                onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                              >
                                <option value="amount">Fixed Amount</option>
                                <option value="percentage">Percentage</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-gray-700 mb-2">
                                {discount.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₦)'}
                              </label>
                              <div className="flex items-center">
                                <FaPercent className="text-gray-400 mr-2" />
                                <input
                                  type="number"
                                  value={discount.price}
                                  onChange={(e) => setDiscount({ ...discount, price: parseFloat(e.target.value) || 0 })}
                                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                                  placeholder={discount.type === 'percentage' ? '0-100' : '0.00'}
                                  min="0"
                                  max={discount.type === 'percentage' ? '100' : undefined}
                                  step={discount.type === 'percentage' ? '1' : '0.01'}
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-2">Description (Optional)</label>
                            <input
                              type="text"
                              value={discount.description}
                              onChange={(e) => setDiscount({ ...discount, description: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d9b683]"
                              placeholder="e.g., Early bird discount"
                            />
                          </div>
                          {discount.price > 0 && (
                            <div className="p-3 bg-yellow-50 rounded border border-yellow-200 mt-3">
                              <p className="text-sm text-yellow-800">
                                Discount will reduce the total by: <strong>
                                  {discount.type === 'percentage'
                                    ? `${discount.price}% (₦${Math.round((subtotalAmount * discount.price) / 100).toLocaleString()})`
                                    : `₦${discount.price.toLocaleString()}`
                                  }
                                </strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order summary */}
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
                        {customPackages.map((item, i) => (
                          <div key={`custom-${i}`} className="flex justify-between">
                            <span>{item.description} × {item.quantity}</span>
                            <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        {discount.price > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Discount</span>
                            <span>-₦{(discountAmount).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-200 mt-3 pt-3 font-bold text-lg flex justify-between">
                        <span>Total</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded flex items-center"
                      >
                        <FaArrowLeft className="mr-2" /> Back to Details
                      </button>

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
                    </div>
                  </div>
                )}
              </>
            ) : (
              // View mode (not editing) - display booking info and invoice summary
              <>
                <div className="space-y-8">
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
                            {formData.event_dates && formData.event_dates.length > 0 ? (formData.event_dates.map(event => event.date)) : 'No date set'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                          <p className="text-gray-800">{formData.event_dates.map(event => event.date_location) || 'No location specified'}</p>
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

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Selected Services</h2>
                    <div className="space-y-6">
                      {selectedPackages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Packages</h3>
                          <div className="space-y-3">
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
                        </div>
                      )}

                      {selectedAddons.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Addons</h3>
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
                        </div>
                      )}

                      {customPackages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Custom Packages</h3>
                          <div className="space-y-3">
                            {customPackages.map(item => (
                              <div key={`cust-${item.invoice_item_id ?? item.description}`} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-800">{item.description}</h4>
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
                        </div>
                      )}

                      {discount.price > 0 && (
                        <>
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Discount</h3>
                          <div className="space-y-3">
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-gray-600 text-sm mt-1">{discount.description}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-gray-600 text-sm">Qty: {discount.quantity}</span>
                                  <p className="text-[#d9b683] font-bold mt-1">-N{(discount.price * discount.quantity).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Payment Summary</h2>
                    <div className="grid md:grid-cols-2 gap-8">
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
                          {customPackages.map((item, i) => (
                            <div key={`cust-sum-${i}`} className="flex justify-between">
                              <span className="text-gray-700">{item.description} × {item.quantity}</span>
                              <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          {discount.price > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-700">Discount</span>
                              <span className="font-medium">-₦{(discount.price * discount.quantity).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-200 mt-3 pt-3 font-bold text-lg flex justify-between">
                          <span>Total Amount</span>
                          <span>₦{bookingData.total_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Payment History</h3>
                        {payments.length > 0 ? (
                          <>
                            <div className="space-y-2 mb-3">
                              {payments.map(payment => (
                                <div key={payment.id} className="flex justify-between">
                                  <span className="text-gray-700">{formatDate(payment.payment_date)}</span>
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
                                <span className={bookingData.amount_due > 0 ? 'text-red-600' : 'text-green-600'}>
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

                    {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 bg-[#d9b683] hover:bg-[#c9a673] text-white font-medium rounded flex items-center justify-center transition-colors order-2 sm:order-1"
                  >
                    <FaArrowLeft className="mr-2" /> Back
                  </button>

                    {user?.is_superuser && (
                      <button
                      type="button"
                      onClick={() => navigate(`/dashboard/invoice/${id}`)}
                      className="px-6 py-2 bg-[#d9b683] hover:bg-[#c9a673] text-white font-medium rounded flex items-center justify-center transition-colors order-1 sm:order-2"
                    >
                      Record Payment
                    </button>
                    )}

                        <button
                    type="button"
                    onClick={() => navigate(`/dashboard/invoice/${id}`)}
                    className="px-6 py-2 bg-[#d9b683] hover:bg-[#c9a673] text-white font-medium rounded flex items-center justify-center transition-colors order-3"
                  >
                    View Full Invoice <FaArrowRight className="ml-2" />
                  </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewEditBooking;
