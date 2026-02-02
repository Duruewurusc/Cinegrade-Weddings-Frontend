import React, {useState} from 'react'
import logo from "../assets/logo.png"
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai'
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../services/UserContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({show=true}) => {
  const [nav, setNav] = useState(true);
  const {logout, user, isAuthenticated} = useUser();
  const location = useLocation();
  const isLoggedIn = isAuthenticated;
  const navigate = useNavigate()

  const handleNav = () => {
    setNav(!nav);
  }

  // Check if current route matches the nav item
  const isActive = (path) => {
    return location.pathname === path;
  }

  return (
    <>
      <div className='flex mx-auto justify-between items-center h-24 px-4 md:px-10 sticky top-0 bg-white shadow-lg z-50'>
        <div className="flex items-center space-x-2">
          <Link to="/">
            <img src={logo} alt="Wedding Brand Logo" className="h-24 w-24 md:h-40 md:w-40 object-contain" />
          </Link>
        </div>
        
        <ul className='hidden md:flex'>
          <li className={`text-lg p-4 hover:text-black transition-colors ${isActive('/') ? 'text-black font-semibold border-b-2 border-[#d9b683]' : 'text-gray-700'}`}>
            <Link to="/">Home</Link>
          </li>
          <li className={`text-lg p-4 hover:text-black transition-colors ${isActive('/gallery') ? 'text-black font-semibold border-b-2 border-[#d9b683]' : 'text-gray-700'}`}>
            <Link to="/gallery">Gallery</Link>
          </li>
          <li className={`text-lg p-4 hover:text-black transition-colors ${isActive('/pricing') ? 'text-black font-semibold border-b-2 border-[#d9b683]' : 'text-gray-700'}`}>
            <Link to="/pricing?category=combo">Pricing</Link>
          </li>
          <li className={`text-lg p-4 hover:text-black transition-colors ${isActive('/aboutus') ? 'text-black font-semibold border-b-2 border-[#d9b683]' : 'text-gray-700'}`}>
            <Link to="/aboutus">About Us</Link>
          </li>
          <li className={`text-lg p-4 hover:text-black transition-colors ${isActive('/blog') ? 'text-black font-semibold border-b-2 border-[#d9b683]' : 'text-gray-700'}`}>
            <Link to="/blog">Blog</Link>
          </li>
          <li className={`text-lg p-4 hover:text-black transition-colors ${isActive('/blog') ? 'text-black font-semibold border-b-2 border-[#d9b683]' : 'text-gray-700'}`}>
            <Link to="/others">Other Events</Link>
          </li>
          
        </ul>
 
        <div className={show ? 'flex items-center' : 'hidden'}>  
          {user && (
            <h3 className='hidden md:block text-sm text-[#2c2c2c] text-center py-3 mr-2'>
              Welcome, <Link to='/dashboard/profile' className='font-medium hover:text-[#d9b683]'>{user.username}</Link>
            </h3>
          )}
          {isLoggedIn ? 
            <button 
              className='text-sm md:text-base mx-1 md:mx-3 h-10 md:h-10 px-3 md:px-4 text-white bg-[#d9b683] rounded-md hover:bg-[#c9a673] transition-colors' 
              onClick={() => {logout();navigate('/login')}}
            >
              Logout
            </button>
            : 
            <button className='text-sm md:text-base mx-1 md:mx-3 h-10 md:h-10 px-3 md:px-4 text-white bg-black rounded-md hover:bg-gray-800 transition-colors'>
              <Link to="/login">Client Login</Link>
            </button>
          }
        </div>

        <div onClick={handleNav} className='block md:hidden p-2 cursor-pointer'>
          {!nav ? <AiOutlineClose size={24}/> : <AiOutlineMenu size={24}/>}
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`fixed w-full bg-white shadow-lg z-40 transition-all duration-300 ease-in-out ${!nav ? 'top-24 opacity-100' : 'top-[-100%] opacity-0'}`}>
        <ul className='mx-auto block md:hidden'>
          <li className={`p-4 border-b border-gray-100 ${isActive('/') ? 'text-black font-semibold bg-gray-50' : 'text-gray-700'}`}>
            <Link to="/" onClick={() => setNav(true)}>Home</Link>
          </li>
          <li className={`p-4 border-b border-gray-100 ${isActive('/gallery') ? 'text-black font-semibold bg-gray-50' : 'text-gray-700'}`}>
            <Link to="/gallery" onClick={() => setNav(true)}>Gallery</Link>
          </li>
          <li className={`p-4 border-b border-gray-100 ${isActive('/pricing') ? 'text-black font-semibold bg-gray-50' : 'text-gray-700'}`}>
            <Link to="/pricing?category=combo" onClick={() => setNav(true)}>Pricing</Link>
          </li>
          <li className={`p-4 border-b border-gray-100 ${isActive('/aboutus') ? 'text-black font-semibold bg-gray-50' : 'text-gray-700'}`}>
            <Link to="/aboutus" onClick={() => setNav(true)}>About Us</Link>
          </li>
          <li className={`p-4 border-b border-gray-100 ${isActive('/blog') ? 'text-black font-semibold bg-gray-50' : 'text-gray-700'}`}>
            <Link to="/blog" onClick={() => setNav(true)}>Blog</Link>
          </li>
        </ul>
      </div>
    </>
  )
}

export default Navbar;