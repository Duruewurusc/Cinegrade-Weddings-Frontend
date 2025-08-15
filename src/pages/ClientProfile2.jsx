import React, {useState, useEffect} from 'react'
import DashboardLayout from '../components/dashboardLayout/';
import Navbar from '../components/Navbar'
import axios from "axios";
import { useNavigate } from "react-router-dom";



export default function ClientProfile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log(token)

        const userRes = await axios.get("http://127.0.0.1:8000/auth/users/me/", config);
        setUser(userRes.data);
        
        
      } catch (err) {
        console.error('Failed to fetch user:', err);
        navigate("/login");
      }
      // localStorage.setItem('client', user.username);
    };

    fetchData();
  }, []);



  return (
    <>
    <Navbar/>
    <DashboardLayout>
      <h1 className="text-2xl font-semibold text-[#d9b683] mb-4">User Profile</h1>
      {/* Form goes here */}
      
      <p><strong>Username:</strong> {user?.username}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Address:</strong> {user?.address}</p>
    
    </DashboardLayout>
    </>
  );
};

