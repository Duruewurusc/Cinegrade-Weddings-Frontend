import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css"
import Navbar from '../components/Navbar'
import Footer from '../components/Footer';
import { GalleryImages } from '../components/GalleryImages';
import {Thumbnails, Counter} from 'yet-another-react-lightbox/plugins';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { useState, useEffect } from 'react';
import { fetchGalleryImages } from '../services/Api';
import bannerImage from '../assets/gallery-banner.jpg';
import { FaSpinner } from 'react-icons/fa';

const Gallery = () => {
    const [numId, setNumId] = useState(-1);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Animation variants
    const bannerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const filterVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const filterItemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    const galleryVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5 }
        },
        hover: { 
            scale: 1.02,
            transition: { duration: 0.3 }
        },
        tap: { scale: 0.98 }
    };

    const handleClickImage = (number) => {
        setNumId(number);
    };

    // Fetch images from API
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await fetchGalleryImages();
                setImages(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    // Filter images based on category
    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredImages(images);
        } else {
            setFilteredImages(images.filter(img => img.category === activeFilter));
        }
    }, [activeFilter, images]);

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'wedding', label: 'Wedding' },
        { id: 'portrait', label: 'Portrait' },
        { id: 'engagement', label: 'Engagement' },
        { id: 'other', label: 'Other Events' }
    ];

    if (loading) {
        return (
            <>
                <Navbar/>
                <div className="flex justify-center items-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <FaSpinner className="text-4xl text-[#d9b683]" />
                    </motion.div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
            <Navbar/>
            <div className="p-4 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#e2cba8] text-white px-4 py-3 rounded relative"
                >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </motion.div>
            </div></>
        );
    }

    return (
        <>
            <Navbar/>
            
            {/* Animated Banner */}
            <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                className="relative h-64 md:h-150 w-full overflow-hidden"
            >
                <img 
                    src={bannerImage} 
                    alt="Gallery Banner" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/100 bg-opacity-40 flex items-center justify-center z-0">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-4xl md:text-6xl font-bold text-[#e0e0e0]"
                    >
                       
                    </motion.h1>
                </div>
            </motion.div>

            {/* Animated Filter Controls */}
            <motion.div
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                className="bg-white py-6 sticky top-0 z-10 shadow-sm"
            >
                <div className="container mx-auto px-4">
                    <motion.div 
                        className="flex flex-wrap justify-center gap-2 md:gap-4"
                    >
                        {filters.map(filter => (
                            <motion.button
                                key={filter.id}
                                variants={filterItemVariants}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded text-sm md:text-base transition-all ${
                                    activeFilter === filter.id 
                                        ? 'bg-[#d9b683] text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {filter.label}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className='py-20 text-5xl text-center font-bold text-[#363636]'
            >
                
            </motion.h1>
            
            <div className="p-4 md:p-10 flex items-center justify-center max-w-[1300px] mx-auto">
                <AnimatePresence mode="wait">
                    {filteredImages.length === 0 ? (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-12 w-full"
                        >
                            <p className="text-gray-500 text-lg">No images found in this category</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeFilter}
                            variants={galleryVariants}
                            initial="hidden"
                            animate="visible"
                            className="columns-1 sm:columns-2 md:columns-3 gap-4"
                        >
                            {filteredImages.map((image, index) => (
                                <motion.div
                                    key={`${image.id}-${activeFilter}`}
                                    variants={imageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => handleClickImage(index)}
                                    className="relative overflow-hidden rounded cursor-pointer mb-4"
                                    layout
                                >
                                    {/* Container to prevent overflow */}
                                    <div className="overflow-hidden rounded w-full h-full">
                                        <img  
                                            src={image.src} 
                                            // alt={`Gallery ${image.id}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Lightbox
                plugins={[Thumbnails, Counter]}
                index={numId}
                open={numId >= 0}
                close={() => setNumId(-1)}
                slides={filteredImages}
            />

            <Footer/>
        </>
    );
};

export default Gallery;