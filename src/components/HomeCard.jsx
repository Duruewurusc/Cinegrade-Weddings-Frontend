import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import homecard from "../assets/homeCard.jpg";
import homecard2 from "../assets/homeCard2.jpg";
import homecard3 from "../assets/homeCard3.jpg";

const HomeCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [homecard, homecard2, homecard3];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className='max-w-5xl flex flex-col md:flex-row mx-auto gap-6 md:gap-10 px-4 py-2'
    >
      {/* Image Carousel */}
      <motion.div 
        layout
        className='relative w-full md:w-1/2 aspect-video md:aspect-auto h-[400px] md:h-[700px] overflow-hidden rounded shadow-lg'
      >
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentIndex ? 1 : 0,
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className='absolute inset-0'
          >
            <img 
              src={img} 
              alt={`Slide ${index}`} 
              className='w-full h-full object-cover'
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Text Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className='flex flex-col justify-center md:w-1/2 py-6 md:py-0'
      >
        <p className='text-gray-600 text-xl md:text-2xl tracking-wide text-center md:text-left'>
          "At <span className='font-bold text-[#d9b683]'>CineGRADE Weddings</span>, we believe that every 
          wedding is a unique love story waiting to be beautifully told. With a team of highly skilled
           photographers and videographers, we specialize in capturing every heartfelt moment, ensuring
            that your big day is preserved in stunning visuals that last a lifetime."
        </p>
      </motion.div>
    </motion.div>
  )
}

export default HomeCard;