import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FaSpinner } from 'react-icons/fa';
import { useUser } from '../services/UserContext';

const EditBookingPage = () => {
  const {user} = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [formData, setFormData] = useState({
    event_type: '',
    event_description: '',
    wedding_date: '',
    location: '',
    additional_notes: '',
    packages: [],
    addons: []

  });


  // useEffect(() => {
  //   if (!user) {
  //     navigate("/login");
  //   }
  // }, [user, navigate]);


  if(id) {

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log(token)

        
        const response = await axios.get(`http://127.0.0.1:8000/api/bookings/${id}/` , config);
        setBooking(response.data);
        console.log(response.data)
        setFormData({
          event_type: response.data.event_type || '',
          event_description: response.data.event_description || '',
          wedding_date: response.data.wedding_date.split('T')[0],
          location: response.data.location || '',
          additional_notes: response.data.additional_notes || '',
         
        });
        setLoading(false);
        console.log(formData)
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.put(`http://127.0.0.1:8000/api/bookings/${id}/`, formData, config);
      navigate('/bookings', { state: { message: 'Booking updated successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setIsSubmitting(false);
    }
  };
  

 if (loading) {
    return (
      <>
       <Navbar/>
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-[#d9b683]" />
      </div>
      </>)
  }

  if (error && !booking) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
    
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Booking</h1>
          <button
            onClick={() => navigate('/dashboard/bookings')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Bookings
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Booking Information</h2>
            <p className="text-gray-600">Booking Code: {booking.booking_code}</p>
            <p className="text-gray-600">Client: {user&& user.first_name || 'Client'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="event_type">
                  Event Type
                </label>
                <select
                  id="event_type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Event Type</option>
                  <option value="White Wedding">White Wedding</option>
                  <option value="Traditional Marriage">Traditional Marriage</option>
                  <option value="Prewedding Shoot">Prewedding Shoot</option>
                  <option value="">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="wedding_date">
                  Wedding Date
                </label>
                <input
                  type="date"
                  id="wedding_date"
                  name="wedding_date"
                  value={formData.wedding_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              

            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="event_description">
                Event Description
              </label>
              <input
                type="text"
                id="event_description"
                name="event_description"
                value={formData.event_description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white ${isSubmitting ? 'bg-[#d9b683]' : 'bg-[#d9b683] hover:bg-[#d8c2a2]'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
  else{

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('http://127.0.0.1:8000/api/bookings/', formData, config);
      navigate('/bookings', { state: { message: 'Booking created successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setIsSubmitting(false);
    }
  };

    return (
    <>
      <Navbar/>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">New Booking</h1>
          <button
            onClick={() => navigate('/dashboard/bookings')}
            className="bg-[#000000] hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Booking Information</h2>
            
            <p className="text-gray-600">Client: {user&& user.first_name || 'Client'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="event_type">
                  Event Type
                </label>
                <select
                  id="event_type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Event Type</option>
                  <option value="White Wedding">White Wedding</option>
                  <option value="Traditional Marriage">Traditional Marriage</option>
                  <option value="Prewedding Shoot">Prewedding Shoot</option>
                  <option value="">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="wedding_date">
                  Wedding Date
                </label>
                <input
                  type="date"
                  id="wedding_date"
                  name="wedding_date"
                  value={formData.wedding_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              

              

              

              
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="event_description">
                Event Description
              </label>
              <input
                type="text"
                id="event_description"
                name="event_description"
                value={formData.event_description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white ${isSubmitting ? 'bg-[#d9b683]' : 'bg-[#d9b683] hover:bg-[#d8c2a2]'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  

     </> 

    )
  }
};

export default EditBookingPage;