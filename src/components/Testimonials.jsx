import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { fetchTestimonials } from '../services/Api';
import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';

const Testimonials = () => { 
  const [testimonials, setTestimonials] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchTestimonialData = async () => {
      try {
        setLoading(true);
        const data = await fetchTestimonials();
        setTestimonials(data || []);
        
        // Filter featured testimonials
        const featured = data ? data.filter(testimonial => testimonial.is_featured === true) : [];
        setFeaturedTestimonials(featured);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonialData();
  }, []);
  
  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    scrollToTestimonial(newIndex);
  };

  const scrollRight = () => {
    // Adjust calculation for featured testimonials
    const itemsToShow = Math.min(3, featuredTestimonials.length);
    const newIndex = Math.min(featuredTestimonials.length - itemsToShow, currentIndex + 1);
    setCurrentIndex(newIndex);
    scrollToTestimonial(newIndex);
  };

  const scrollToTestimonial = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.offsetWidth || 0;
      const scrollPosition = index * (cardWidth + 32); // 32px accounts for gap between cards
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <div className="text-center py-12">Loading testimonials...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error loading testimonials</div>;
  
  // Use featuredTestimonials instead of all testimonials
  if (!featuredTestimonials.length) return <div className="text-center py-4">No featured testimonials available</div>;

  // Determine how many dots to show based on featured testimonials
  const itemsPerView = Math.min(3, featuredTestimonials.length);
  const maxIndex = Math.max(0, featuredTestimonials.length - itemsPerView);
  
  return ( 
    <div className='max-w-7xl mx-auto px-4 pt-12 pb-16 relative'>
      <h2 className='text-[#d9b683] text-4xl font-bold text-center mb-10'>What Our Clients Say</h2>
      
      <div className='relative'>
        <button 
          onClick={scrollLeft}
          disabled={currentIndex === 0}
          className={`absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Scroll left"
        >
          <FaChevronLeft className="text-gray-700 text-xl" />
        </button>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-hidden scroll-smooth gap-8 px-4 py-2"
        >
          {featuredTestimonials.map((client) => (
            <div 
              key={client.id} 
              className="flex-shrink-0 w-[calc(100%-16px)] sm:w-[calc(50%-20px)] lg:w-[calc(33.333%-22px)] px-0"
              style={{ minWidth: 0 }} // Fixes flexbox overflow issue
            >
              <div className="bg-[#f8f9fa] rounded-lg p-6 h-full flex flex-col relative">
                <FaQuoteLeft className="text-[#d9b683] text-3xl opacity-20 absolute top-4 left-4" />
                <div className="flex-grow pl-8 pt-4">
                  <p className="text-gray-700 italic text-lg mb-6">"{client.content}"</p>
                </div>
                
                <div className='flex items-center mt-auto'>
                  <div className='rounded-full overflow-hidden w-14 h-14 flex-shrink-0 border-2 border-[#d9b683]'>
                    <img 
                      className='w-full h-full object-cover' 
                      src={client.image} 
                      alt={client.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.jpg"; // Fallback image
                      }}
                    />
                  </div>
                  <div className='px-4'>
                    <h3 className='font-bold text-gray-900'>{client.name}</h3>  
                    <h4 className='text-gray-600'>{client.location}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={scrollRight}
          disabled={currentIndex >= maxIndex}
          className={`absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors ${currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Scroll right"
        >
          <FaChevronRight className="text-gray-700 text-xl" />
        </button>
      </div>
      
      {/* Dot indicators - only show if there are more than 3 featured testimonials */}
      {featuredTestimonials.length > 3 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.max(1, featuredTestimonials.length - 2) }).map((_, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                scrollToTestimonial(idx);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-[#d9b683]' : 'bg-gray-300'}`}
              aria-label={`View testimonials ${idx + 1} to ${idx + 3}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Testimonials;