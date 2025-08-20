import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/Api";


export default function Dashboard() {
    const [user, setUser] = useState(null);
    
    
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("access");
          const config = { headers: { Authorization: `Bearer ${token}` } };
  
          const userRes = await api.get("/auth/users/me/", config);
          setUser(userRes.data);
          
          
  
        //   const bookingRes = await axios.get("/api/bookings/me/", config);
        //   setBooking(bookingRes.data);
  
        //   const packagesRes = await axios.get("/api/packages/", config);
        //   setPackages(packagesRes.data);
        } catch (err) {
          console.error(err);
          navigate("/login");
        }
        localStorage.setItem('client', user.username);
      };
  
      fetchData();
    }, []);
  
    const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
    };
  
    return (
        <div className="flex min-h-screen text-white ">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1a1a1a] p-6 space-y-6 hidden md:block">
          <div className="text-2xl font-bold text-[#d9b683]">Cinegrade</div>
          <nav className="space-y-2 text-sm">
            <a href="/dashboard/new-booking" className="block p-2 rounded hover:bg-[#2e2e2e]">New Booking</a>
            <a href="/dashboard/bookings" className="block p-2 rounded hover:bg-[#2e2e2e]">Booking List</a>
            <a href="/dashboard/receipts" className="block p-2 rounded hover:bg-[#2e2e2e]">Receipts</a>
            <a href="/dashboard/profile" className="block p-2 rounded hover:bg-[#2e2e2e]">Profile</a>
            <a href="/" className="block p-2 rounded hover:bg-[#2e2e2e]">Links</a>
          </nav>
        </aside>


     
        <main className="flex-1 p-6 bg-white text-black overflow-auto">
        {user && (
          <div className="space-y-6">
            <p className="text-lg">
              Hello, <span className="font-semibold">{user.username}</span> 👋
              {user.email}
            </p>
  
            
          </div>
        )}
      </main>
  
        
      </div>
    );
  }
  