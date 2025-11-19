import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const api = axios.create({
  baseURL: 'api.cinegradevisuals.com'
  // baseURL: 'https://cgapi-8nul.onrender.com'
  //'http://127.0.0.1:8000/',
  // baseURL: 'http://127.0.0.1:8000/',
 
  
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
  console.log(token)
  const bookingResponse = await api.post('/api/bookings/',bookingData, config);
  console.log(bookingData)
  return bookingResponse.data
}

export const createPayment = async (paymentData) =>{
  const token = localStorage.getItem("access");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await api.post('/api/payments/',paymentData, config);
  return response.data
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


export const updatePayment = async (id, paymentData) =>{
  const token = localStorage.getItem("access");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await api.put(`/api/payments/${id}/`, paymentData, config);
  return response.data
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




// Request interceptor → attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    // console.log("🔑 Attached access token:", token);
  } else {
    console.log("⚠️ No access token found in localStorage");
  }
  return config;
});

// Response interceptor → handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("⛔ Access token expired or invalid. Trying refresh...");
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        console.log("🔄 Refresh token:", refresh);

        if (!refresh) {
          console.log("⚠️ No refresh token found, logging out...");
          throw new Error("No refresh token");
        }

        // Request new access token
        const res = await api.post("/auth/jwt/refresh/", {
          refresh: refresh,
        });

        const newAccess = res.data.access;
        console.log("✅ Got new access token:", newAccess);

        localStorage.setItem("access", newAccess);

        // Retry the failed request
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log("❌ Refresh failed, logging out:", refreshError);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);






export default api;