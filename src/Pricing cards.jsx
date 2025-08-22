import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { Link, useNavigate} from 'react-router-dom'
import { useUser } from '../services/UserContext';
import bannerImage from '../assets/banner 2.jpg'
import { fetchPackage} from '../services/Api'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const bannerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8 }
  }
}

const filterVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
}

const packageVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
    transition: { duration: 0.4 }
  }
}

const Pricing = () => {
    const navigate = useNavigate()
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { booking, setBooking } = useUser()
    const { user } = useUser()
    const [activeFilter, setActiveFilter] = useState('combo')

    // Filter packages
    const photoPackages = packages.filter(pkg => pkg.category === 'photo');
    const videoPackages = packages.filter(pkg => pkg.category === 'video');
    const comboPackages = packages.filter(pkg => pkg.category === 'combo');

    useEffect(() => {
        const fetchPackageList = async () => {
            try {
                const response = await fetchPackage();
                setPackages(response)
                setLoading(false);
            }
            catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }
        fetchPackageList();
    }, []);

    const handleFilterChange = (filterType) => {
        setActiveFilter(filterType);
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                        <FaSpinner className="text-4xl text-[#d9b683]" />
                    </motion.div>
                </div>
            </>)
    }

    if (error) {
        return (
        <>
        <Navbar /> 
      
            <motion.p 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#d4bf9f]  text-white px-4 py-3 rounded relative p-4 max-w-4xl mx-auto mt-8" 
                    role="alert"
                >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
            </motion.p>
       
    </> )}

    // Function to render packages in card layout
    const renderPackageCards = (packages, title) => {
        if (!packages || packages.length === 0) return null;
        
        return (
            <>
                <motion.h3 
                     variants={itemVariants}
                            className='text-center font-bold text-xl md:text-2xl pb-6'
                        >
                            Photography Packages
                </motion.h3>
                <div className='w-full py-2 px-4'>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {photoPackages.map((pkg) => (
                            <motion.div 
                                key={pkg.id}
                                variants={packageVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                className="flex flex-col bg-transparent rounded-2xl overflow-hidden h-full shadow-2xl"
                            >
                                <div className='relative h-80 overflow-hidden rounded-t-2xl'>
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${pkg.image})` }}
                                    >

                                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h3 className="text-3xl font-bold mb-2">{pkg.package_name}</h3>
                                        <p className="text-xl font-semibold">
                                            ₦{parseFloat(pkg.price).toLocaleString()}
                                            {pkg.is_popular && (
                                                <motion.span 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="ml-3 inline-block bg-[#d9b683] text-white text-sm px-4 py-1 rounded-full"
                                                >
                                                    Popular
                                                </motion.span>
                                            )}
                                        </p>
                                    </div>


                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h3 className="text-3xl font-bold mb-2">{pkg.package_name}</h3>
                                        <p className="text-xl font-semibold">
                                            ₦{parseFloat(pkg.price).toLocaleString()}
                                            {pkg.is_popular && (
                                                <motion.span 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="ml-3 inline-block bg-[#d9b683] text-white text-sm px-4 py-1 rounded-full"
                                                >
                                                    Popular
                                                </motion.span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className='p-6 flex flex-col flex-grow bg-white'>
                                    <p className="py-2 text-gray-800 text-lg mb-3">{pkg.description}</p>
                                    <ul className="list-disc list-inside text-base text-gray-700 flex-grow space-y-2">
                                        {pkg.deliverables.split(",").map((item, index) => (
                                            <li key={index} className="font-medium">{item.trim()}</li>
                                        ))}
                                    </ul>
                                    <div className="mt-6">
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.98 }}
                                            className='w-full text-lg h-12 bg-[#222222] text-white border-gray-300 rounded-xl hover:bg-gray-800 font-bold'
                                            onClick={() => {
                                                localStorage.setItem('order', pkg.id)
                                                setBooking(JSON.stringify(pkg));
                                                console.log('order is'+localStorage.getItem('order'));
                                                user ? navigate('/dashboard/new-booking') : navigate('/login')
                                            }}
                                        >
                                            Book Now
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            <Navbar />
            {/* Banner Section */}
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={bannerVariants}
                className="relative h-64 md:h-96 w-full overflow-hidden"
            >
                <img 
                    src={bannerImage} 
                    alt="Gallery Banner" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90 flex items-center justify-center z-0">
                    <h1 className="text-4xl md:text-6xl font-bold text-white">Our Packages</h1>
                </div>
            </motion.div>

            {/* Main content with gray background */}
            <div className="bg-gray-100 w-full">
                <div className="pt-10 pb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='text-[#d9b683] text-4xl md:text-5xl font-bold text-center mb-4 py-10'
                    >
                        Wedding packages
                    </motion.h2>
                    
                    {/* Filter buttons */}
                    <motion.div 
                        variants={filterVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 px-4"
                    >
                        {['all', 'photo', 'video', 'combo'].map((filterType) => (
                            <motion.button
                                key={filterType}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, backgroundColor: "#d9b683", color: "white" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleFilterChange(filterType)}
                                className={`px-6 py-3 rounded-xl text-base md:text-lg font-bold ${activeFilter === filterType 
                                        ? 'bg-[#d9b683] text-white' 
                                        : 'bg-white text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                {filterType === 'all' ? 'All Packages' : 
                                filterType === 'photo' ? 'Photo Packages' :
                                filterType === 'video' ? 'Video Packages' : 'Combo Packages'}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* Conditionally render packages based on active filter */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="pb-16"
                >
                    {(activeFilter === 'all' || activeFilter === 'photo') && 
                        renderPackageCards(photoPackages, "Photography Packages")}
                    
                    {(activeFilter === 'all' || activeFilter === 'video') && 
                        renderPackageCards(videoPackages, "Video Packages")}
                    
                    {(activeFilter === 'all' || activeFilter === 'combo') && 
                        renderPackageCards(comboPackages, "Photo and Video Combo Packages")}
                    
                    {/* Terms and Conditions Section */}
                    <div className="max-w-7xl mx-auto mt-20 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-8 rounded-2xl shadow-2xl"
                        >
                            <h3 className="text-3xl font-bold text-[#d9b683] mb-6 text-center">Terms & Conditions</h3>
                            <div className="text-gray-800 space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">1. Booking & Reservation:</p>
                                    <p className="ml-4 mt-1">A non-refundable deposit of 50% is required to secure your booking date. The remaining balance is due 14 days prior to your event.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">2. Cancellation Policy:</p>
                                    <p className="ml-4 mt-1">In the event of cancellation, the deposit is non-refundable. Cancellations made less than 30 days before the event will incur 100% of the package cost.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">3. Rescheduling:</p>
                                    <p className="ml-4 mt-1">Clients may reschedule once without penalty if notice is provided at least 30 days prior to the original event date, subject to availability.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">4. Delivery Time:</p>
                                    <p className="ml-4 mt-1">Final edited photos/videos will be delivered within 4-8 weeks after the event. Rush delivery may be available for an additional fee.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">5. Copyright:</p>
                                    <p className="ml-4 mt-1">The photographer/videographer retains copyright of all images/videos while granting the client permission to reproduce and share images/videos.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">6. Liability:</p>
                                    <p className="ml-4 mt-1">In the unlikely event of equipment failure, illness, or other circumstances beyond our control, liability is limited to a full refund of all payments received.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">7. Additional Expenses:</p>
                                    <p className="ml-4 mt-1">Any additional expenses incurred during the assignment (travel, accommodation, etc.) will be charged to the client.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold text-lg text-[#222222]">8. Creative License:</p>
                                    <p className="ml-4 mt-1">The photographer/videographer reserves the right to use discretion regarding editing and processing of final images/videos.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </>
    )
}

export default Pricing