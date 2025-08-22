import React, { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Import local images from assets folder
import Image1 from '../assets/gallery/img-1.jpg';
import Image2 from '../assets/gallery/img-13.jpg';
import Image3 from '../assets/gallery/img-14.jpg';
import Image4 from '../assets/gallery/img-5.jpg';
import Image5 from '../assets/gallery/img-7.jpg';
import Image6 from '../assets/gallery/img-12.jpg';
import Image7 from '../assets/gallery/img-9.jpg';
import Image8 from '../assets/gallery/img-11.jpg';
import Image9 from '../assets/gallery/img-12.jpg';

const ImageSlider = () => {
  // Using local images with varying widths
  const [images] = useState([
    { id: 1, src: Image1, alt: "Gallery image 1" },
    { id: 2, src: Image2, alt: "Gallery image 2" },
    { id: 3, src: Image3, alt: "Gallery image 3" },
    { id: 4, src: Image4, alt: "Gallery image 4" },
    { id: 5, src: Image5, alt: "Gallery image 5" },
    { id: 6, src: Image6, alt: "Gallery image 6" },
    { id: 7, src: Image7, alt: "Gallery image 6" },
    { id: 8, src: Image8, alt: "Gallery image 6" },
    { id: 9, src: Image9, alt: "Gallery image 6" },
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3); // Number of images visible at once

  // Adjust visible count based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, visibleCount]);

  // Calculate the actual transform value for seamless cycling
  const getTransformValue = () => {
    if (visibleCount >= images.length) {
      return 0;
    }
    
    // For seamless cycling, we need to handle the transition when reaching the end
    if (currentIndex > images.length - visibleCount) {
      const overflow = currentIndex - (images.length - visibleCount);
      return -((images.length - visibleCount) * (100 / visibleCount) + overflow * (100 / visibleCount));
    }
    
    return -currentIndex * (100 / visibleCount);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto p-4">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-lg">
        {/* Images */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(${getTransformValue()}%)` 
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`flex-shrink-0 p-2 `}
              style={{ width: `${100 / visibleCount}%` }}
            >
              <div className="relative group h-100">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover shadow-md transition-transform duration-300 group-hover:scale-105"/>
                
              </div>
            </div>
          ))}
          
          {/* Add clones for seamless cycling */}
          {images.slice(0, visibleCount).map((image, index) => (
            <div
              key={`clone-${image.id}`}
              className={`flex-shrink-0 p-2 `}
              style={{ width: `${100 / visibleCount}%` }}
            >
              <div className="relative group h-100">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover shadow-md transition-transform duration-300 group-hover:scale-105"/>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
          aria-label="Previous images"
        >
          <FiChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
          aria-label="Next images"
        >
          <FiChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Dots Indicator */}
      {images.length > visibleCount && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentIndex === index
                  ? 'bg-[#d9b683] scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;