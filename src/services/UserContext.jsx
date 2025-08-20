// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from './Api';

import { fetchCompanyInfo } from './Api';
const UserContext = createContext();



export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const[booking, setBooking] = useState(()=>{ const saved = localStorage.getItem("booking");
    return saved ? JSON.parse(saved) : null;
  })
  const [companyInfo, setCompanyInfo] = useState(null);

  // const navigate = useNavigate();

  useEffect(()=>{
    const fetchCompanyData = async () =>{
       try {
          
          const companyRes = await fetchCompanyInfo();
          console.log(companyRes)
          setCompanyInfo(companyRes)
          
        } catch (error) {
          
          console.error('Error fetching company data:', error);
        }
      
      
      setLoading(false);
      }
      fetchCompanyData()
      

    

  },[])

  useEffect(() => {
    const fetchClientData = async () => {
      
        const token = localStorage.getItem("access");

      if(token){
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
       
        try {
          const response = await api.get("/auth/users/me/")
          setUser(response.data);
          console.log(response.data)
          setIsAuthenticated(true);  
        } 
        catch (error) {
          
          console.error('Error fetching client data:', error);
        }
      
      }
      setLoading(false);
    };

    fetchClientData();
  }, []);

   const login = async (username, password) => {
        try {
          const response = await api.post('/auth/jwt/create/', {
                username,
                password
            });
            
            const { access, refresh } = response.data;
            console.log(response.data)
            
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            // Get user data
            const userResponse = await api.get('/auth/users/me/', { headers: { Authorization: `Bearer ${access}` } });
            
            setUser(userResponse.data);
            setIsAuthenticated(true);
            console.log(userResponse.data.username)
            console.log(localStorage.getItem('access'))
            
      
            
            return { success: true };
        } 
        catch (error) {
            console.error("Login failed:", error);
            return { 
                success: false, 
                error: error.response?.data?.detail || 'Login failed' 
            };
        }
    };

    const logout = () => {
        // const navigate = useNavigate();
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('booking');
        localStorage.removeItem('bookingData')
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        
        setBooking(null)
        // navigate('/login');
    };
    useEffect(() => {
    localStorage.setItem("booking", JSON.stringify(booking));
    }, [booking]);

// Add this inside the AuthProvider component, before the return statement

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('access');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                try {
                    const refreshToken = localStorage.getItem('refresh');
                    const response = await api.post('/auth/jwt/refresh/', {
                        refresh: refreshToken
                    });
                    
                    const { access } = response.data;
                    localStorage.setItem('access', access);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    
                    return axios(originalRequest);
                } catch (refreshError) {
                    logout();
                    return Promise.reject(refreshError);
                }
            }
            
            return Promise.reject(error);
        }
    );

    return () => {
        axios.interceptors.request.eject(requestInterceptor);
        axios.interceptors.response.eject(responseInterceptor);
    };
}, [logout]);




  return (
    <UserContext.Provider value={{ 
      user, 
      isAuthenticated,
      loading, 
      booking,
      companyInfo,
      login, 
      logout,
      setBooking, }}>
      
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
