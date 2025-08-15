import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className=" w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-[90vh] min-h-[600px] max-h-[1000px] bg-fixed bg-center bg-cover flex items-center"
        style={{ 
          backgroundImage: "url('/hero.jpg')",
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/100 z-0"></div>
        {/* font-advent-pro */}
        <div className="container mx-auto px-20 z-10">
          <motion.div 
            initial={{ opacity: 0, x:-100 }}
            animate={{ opacity: 1, x:0 }}
            transition={{ delay: 0.4, duration: 0.8 }} 
            className="max-w-3xl text-center md:text-left"
          >
            <h1 className="font-serif font-medium text-4xl md:text-6xl lg:text-7xl  tracking-tight text-white mb-4">
              Capturing Timeless Moments
            </h1>  
            
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
              CineGRADE Weddings is a team of professional wedding photographers and 
              videographers passionate about the art of wedding storytelling
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-3 text-lg font-medium text-white bg-[#3d3d3d] rounded-md hover:bg-[#d9b683] transition-colors shadow-lg"
                >
                  Book Now
                </motion.button>
              </Link>
              
              <Link to="/gallery">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-3 text-lg font-medium text-white bg-transparent border-2 border-white rounded-md hover:bg-white/10 transition-colors"
                >
                  View Gallery
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero;