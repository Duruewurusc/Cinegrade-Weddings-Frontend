import React from 'react';
import AdaImage from "../assets/ada.jpg"
import { 
  FaCamera, 
  FaVideo, 
  FaHeart, 
  FaBroadcastTower, 
  FaCircle, 
  FaInstagram, 
  FaPaperPlane,
  FaQuoteLeft,
  FaBoxOpen,
  FaEnvelope
} from 'react-icons/fa';

const WhatWeDo = () => {
  const services = [
    {
      title: "Wedding and Event Photography",
      description: "Natural, candid, and timeless images that reflect the real moments — big and small.",
      icon: <FaCamera className="text-[#d9b683] text-xl" />
    },
    {
      title: "Videography",
      description: "Cinematic wedding films that feel personal and emotional, crafted to reflect your day authentically.",
      icon: <FaVideo className="text-[#d9b683] text-xl" />
    },
    {
      title: "Engagement Shoots",
      description: "A relaxed, pre-wedding session to capture your connection and help you get camera-comfortable.",
      icon: <FaHeart className="text-[#d9b683] text-xl" />
    },
    {
      title: "Live Streaming",
      description: "Share your day with loved ones anywhere in the world, in real-time and high quality.",
      icon: <FaBroadcastTower className="text-[#353535] text-xl" />
    },
    {
      title: "360 Photo Booth",
      description: "An interactive experience your guests will love — fun, stylish, and perfect for social sharing.",
      icon: <FaCircle className="text-[#353535] text-xl" />
    },
    {
      title: "Content Creation",
      description: "Behind-the-scenes moments, reels, and social-ready content delivered fast — perfect for sharing the day as it unfolds.",
      icon: <FaInstagram className="text-[#353535] text-xl" />
    },
    {
      title: "Drone Coverage",
      description: "Aerial shots that add a cinematic touch and capture the full beauty of your location.",
      icon: <FaPaperPlane className="text-[#353535] text-xl" />
    },
  ];

  return (
    <div className="w-full bg-[#f1f1f1] py-30 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative pb-4">
            Our Premium Services
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#d9b683] rounded-full"></div>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional photography and videography services crafted to immortalize your most precious moments
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Image and Quote */}
          <div className="lg:w-1/2 flex flex-col gap-10">
            {/* Image Card */}
            <div className="relative group overflow-hidden rounded shadow-2xl">
              <div className="bg-gray-200 rounded w-full h-200 flex items-center justify-center">
                  <img src={AdaImage}></img>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Quote Card */}
            {/* <div className="bg-gradient-to-r from-[#c0c0c0] to-[#999999] p-8 rounded shadow-xl text-black relative overflow-hidden"> */}
            <div className=" p-8 rounded shadow-xl text-black relative overflow-hidden">
              <div className="absolute -top-4 -right-4 text-8xl opacity-10">
                <FaQuoteLeft />
              </div>
              <p className="text-[#313131] text-2xl font-medium italic relative z-10">
                "We believe in building real connections with our couples, so when the big day comes, it feels like you're being filmed and photographed by friends who genuinely care."
              </p>
              {/* <div className="mt-6 flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <div className="bg-gray-200 border-2 rounded-full w-12 h-12"></div>
                </div>
                <div>
                  <p className="font-bold text-xl">Ada Lovelace</p>
                  <p className="text-amber-100">Lead Photographer & Founder</p>
                </div>
              </div> */}
            </div>
          </div>

          {/* Right Column - Services */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded shadow-lg p-6">
              <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                <div className="bg-[#ffffff] p-3 rounded-lg mr-4">
                  <FaCamera className="text-[#181818] text-xl" />
                </div>
                <h3 className="text-2xl md:text-3xl  text-gray-900 ">
                  What We Offer
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100  transition-all duration-300 group "
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 rounded mr-4  transition-colors">
                        <div className="text-xl group-hover:text-white transition-colors">
                          {service.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif font-medium text-lg mb-2  transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

       
      </div>

    </div>
  )
}

export default WhatWeDo;