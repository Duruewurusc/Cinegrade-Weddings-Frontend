import React, { useState, useEffect, useRef } from 'react';
import { fetchGalleryImages } from '../services/Api';
import banner from "../assets/cgw banner.jpg";

const ImageSlider = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    // Fetch 20 random images from your API
    const fetchImages = async () => {
      try {
        // Replace with your actual API endpoint
      
        const data = await fetchGalleryImages();
        
        // Get 20 random images (or all if less than 20 available)
        const randomImages = data.sort(() => 0.5 - Math.random()).slice(0, 20);
        setImages(randomImages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0 || loading) return;

    // Set up the sliding animation
    const slider = sliderRef.current;
    let animationFrame;
    let position = 0;
    const speed = 0.4; // Adjust speed as needed

    const animate = () => {
      position -= speed;
      
      // Reset position when we've scrolled all images
      if (-position >= slider.scrollWidth / 2) {
        position = 0;
      }
      
      slider.style.transform = `translateX(${position}px)`;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [images, loading]);

  if (loading) {
    return (
          <div className="relative w-full h-[60vh] overflow-hidden">
      <img
        src={banner}
        alt="Loading gallery"
        className="w-full h-full object-cover"
      />

      {/* optional dark overlay + spinner */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg tracking-wide">Loading gallery...</p>
      </div>
    </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 text-xl text-gray-600">
        
      </div>
    );
  }

  return (
    
    <div className="py-10 border-b border-[#d9b683] shadow-lg relative w-full h-[60vh] overflow-hidden bg-[#e9e9e9] bg-gradient-to-b from-transparent via-black/20 to-black/100 bg-opacity-40">
      {/* Slider track */}
      <div 
        ref={sliderRef}
        className="absolute left-0 flex h-full will-change-transform"
      >
        {/* Duplicate images for seamless looping */}
        {[...images, ...images].map((img, index) => (
          <div 
            key={`${img.id}-${index}`} 
            // className="flex-none w-[300px] h-full mr-5 pb-4"
            className="flex-none w-[300px] h-full pb-4"
          >
            <img 
              src={img.src} 
              alt={img.title || `Gallery image ${img.id}`}
              className="w-full h-full object-cover rounded shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;