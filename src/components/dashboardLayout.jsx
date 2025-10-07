import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiPlus,
  FiList,
  FiFileText,
  FiUser,
  FiLink
} from 'react-icons/fi';
import { FaCalendarDay, FaChartBar } from "react-icons/fa";
import { useUser } from '../services/UserContext';

const navItems = [
  { label: 'New Booking', path: '/dashboard/new-booking', icon: <FiPlus /> },
  { label: 'Bookings', path: '/dashboard/bookings', icon: <FiList /> },
  { label: 'Payments', path: '/dashboard/payments', icon: <FiFileText /> },
  { label: 'Profile', path: '/dashboard/profile', icon: <FiUser /> },
  { label: 'Links', path: '/dashboard/links', icon: <FiLink /> },
];

const adminNavItems = [
  { label: 'Upcoming Events', path: '/dashboard/upcoming-events', icon: <FaCalendarDay /> },
  { label: 'Customer List', path: '/dashboard/clientlist', icon: <FiUser /> },
  { label: 'Create Booking', path: '/dashboard/new-booking', icon: <FiPlus /> },
  { label: 'Add Payment', path: '/dashboard/add-payment', icon: <FiPlus /> },
  { label: 'All Bookings', path: '/dashboard/bookings', icon: <FiList /> },
  { label: 'Payments Records', path: '/dashboard/payments', icon: <FiFileText /> },
  { label: 'Analytics', path: '/dashboard/analytics', icon: <FaChartBar /> },

]

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {user} = useUser()
  
  // console.log('is admin?'+user?.is_superuser)

  return (
    
    <div className="flex h-full text-white bg-black">
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-4 text-[#d9b683] absolute top-1 left-0 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX size={30} /> : <FiMenu size={30} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`py-20 fixed z-40 md:relative top-0 left-0 h-full w-64 bg-[#1a1a1a] p-6 space-y-6 transform md:translate-x-0 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="text-2xl pt-20 font-bold text-[#d9b683]">Welcome, {user?.first_name}</div>
        {!user?.is_superuser?
        <nav className="space-y-2 text-lg">
          {navItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded hover:bg-[#2e2e2e] transition ${
                  isActive ? 'bg-[#d9b683] text-black font-semibold' : ''
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>:

        <nav className="space-y-2 text-lg">
          {adminNavItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded hover:bg-[#2e2e2e] transition ${
                  isActive ? 'bg-[#d9b683] text-black font-semibold' : ''
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>
        
        
        }
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      {/* <main className="flex-1 p-6 bg-white text-black overflow-y-auto w-full">
       
      </main> */}
    </div>
  );
};

export default DashboardLayout;
