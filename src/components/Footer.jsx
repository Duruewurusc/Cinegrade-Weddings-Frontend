import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt,FaPhone,FaEnvelope  } from 'react-icons/fa'

const Footer = () => {
  return (
    // <div className='h-[100px] bg-[#d9b683] text-center py-6 '>©2025 CineGRADE Weddings</div>
    <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 text-gray-400">CineGRADE WEDDINGS</h3>
              <p className="text-gray-400 mb-4">Capturing the most beautiful moments of your life with artistry and passion.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-brand transition">
                  <FaFacebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-brand transition">
                  <FaInstagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-brand transition">
                  <FaLinkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-brand transition">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand transition">Portfolio</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand transition">Packages</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="h-5 w-5 mr-2 mt-0.5" />
                  <span>23 forest Crescent GRA Enugu, Nigeria</span>
                </li>
                <li className="flex items-start">
                  <FaPhone className="h-5 w-5 mr-2 mt-0.5" />
                  <span>+234703763132</span>
                </li>
                <li className="flex items-start">
                  <FaEnvelope className="h-5 w-5 mr-2 mt-0.5" />
                  <span>info@cinegradeweddings.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CineGRADE Visuals. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}

export default Footer