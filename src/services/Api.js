import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  // baseURL: 'http://192.168.116.59:8000',
 
  
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

        

export const fetchBookings = async (bookingId = null) => {
  const token = localStorage.getItem("access");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  // If bookingId is provided, fetch specific booking
  if (bookingId) {
    const bookingResponse = await api.get(`/api/bookings/${bookingId}/`, config);
    return bookingResponse.data;
  }
  
  // Otherwise fetch all bookings
  const bookingResponse = await api.get('/api/bookings/', config);
  return bookingResponse.data;
}


export const postBookings = async (bookingData) =>{
  const token = localStorage.getItem("access");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const bookingResponse = await api.post('/api/bookings/',bookingData, config);
  return bookingResponse.data
}

export const updateBookings = async (id, bookingData) =>{
  const token = localStorage.getItem("access");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const bookingResponse = await api.put(`/api/bookings/${id}/`, bookingData, config);
  return bookingResponse.data
}

export const deleteBookings = async (id) =>{
  const token = localStorage.getItem("access");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const bookingResponse = await api.delete(`/api/bookings/${id}/`, config);
  return bookingResponse.data
}


export const fetchCompanyInfo = async () =>{
  const response = await api.get('/api/companyinfo/');
  return response.data
}

export const fetchClientList = async () =>{
  const clientResponse = await api.get('/api/users/');``
  return clientResponse.data
}

export const deleteClientList = async (id)=>{
  const Response = await api.delete(`/api/users/${id}/`);
  return Response.data

}


export const fetchGalleryImages = async ()=>{
  const galleryResponse = await api.get('/api/gallery/');
  return galleryResponse.data

}
export const fetchPackage = async ()=>{
  const packageResponse = await api.get('/api/package/');
  return packageResponse.data

}

export const fetchAddon = async ()=>{
  const addonResponse = await api.get('/api/addon/');
  return addonResponse.data

}

export const fetchInvoiceItem = async (id)=>{
  // const invoiceResponse = await api.get('/api/invoiceitem/');
  // return invoiceResponse.data
 if (id) {
    const Response = await api.get(`/api/invoiceitem/${id}/`);
    return Response.data;
  }
  
  // Otherwise fetch all bookings
  const Response = await api.get('/api/invoiceitem/');
  return Response.data;
}

export const postInvoiceItem = async (packagedata)=>{
  const invoiceResponse = await api.post('/api/invoiceitem/', packagedata);
  return invoiceResponse.data

}

export const updateInvoiceItem = async (id, packagedata)=>{
  const invoiceResponse = await api.put(`/api/invoiceitem/${id}/`, packagedata);
  return invoiceResponse.data

}

export const deleteInvoiceItem = async (id)=>{
  const invoiceResponse = await api.delete(`/api/invoiceitem/${id}/`);
  return invoiceResponse.data

}



export const fetchTestimonials = async ()=>{
  const TestimonialResponse = await api.get('/api/testimonials/');
  return TestimonialResponse.data

}

export const fetchPayments = async (paymentId = null) => {
  const token = localStorage.getItem("access");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  // If bookingId is provided, fetch specific booking
  if (paymentId) {
    const bookingResponse = await api.get(`/api/payments/${paymentId}/`, config);
    return bookingResponse.data;
  }
  
  // Otherwise fetch all bookings
  const bookingResponse = await api.get('/api/payments/', config);
  return bookingResponse.data;
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or your token storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login when 401 occurs
      const navigate = useNavigate();
      navigate('/login');
      // You might also want to clear any user data here
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);



export default api;