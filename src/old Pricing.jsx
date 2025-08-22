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
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 }
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/100 bg-opacity-40 flex items-center justify-center z-0">
                    {/* <h1 className="text-4xl md:text-6xl font-bold text-[#e0e0e0]">Our Gallery</h1> */}
                </div>
            </motion.div>

            <div className="pt-10">
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
                    className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 px-4"
                >
                    {['all', 'photo', 'video', 'combo'].map((filterType) => (
                        <motion.button
                            key={filterType}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFilterChange(filterType)}
                            className={`px-4 py-2 rounded-md text-sm md:text-base ${
                                activeFilter === filterType 
                                    ? 'bg-[#d9b683] text-white' 
                                    : 'bg-gray-200 hover:bg-gray-300'
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
            >
                {(activeFilter === 'all' || activeFilter === 'photo') && photoPackages.length > 0 && (
                    <>
                        <motion.h3 
                            variants={itemVariants}
                            className='text-center font-bold text-xl md:text-2xl pb-6'
                        >
                            Photography Packages
                        </motion.h3>
                        <div className='max-w-4xl mx-auto py-2 '>
                            {photoPackages.map((pkg) => (
                                <motion.div 
                                    key={pkg.id}
                                    variants={packageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    className="flex flex-col md:flex-row mx-auto gap-10 px-6 mb-10 py-6 bg-[#e9e9e9] shadow-lg rounded-lg"
                                >
                                    <div className='w-[500px] h-[440px] px-auto md:px-6 mt-1 items-center justify-center overflow-hidden'>
                                        <motion.img 
                                            src={pkg.image} 
                                            className='mt-[-40px]'
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        />
                                    </div>
                                    <div className=''>
                                        <h3 className="text-[#272727] pt-7 text-3xl font-bold">{pkg.package_name}</h3>
                                        <p className="py-2 text-[#272727] text-lg mb-3">{pkg.description}</p>
                                        <ul className="list-disc list-inside text-lg text-gray-600">
                                            {pkg.deliverables.split(",").map((item, index) => (
                                                <li key={index}>{item.trim()}</li>
                                            ))}
                                        </ul>
                                        <p className="text-gray-800 font-bold mb-2 py-6">
                                            ₦{parseFloat(pkg.price).toLocaleString()}
                                            {pkg.is_popular && (
                                                <motion.span 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="mx-3 inline-block bg-[#d9b683] text-white text-xs px-5 py-1 rounded-full"
                                                >
                                                    Popular
                                                </motion.span>
                                            )}
                                        </p>
                                        <motion.button 
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                            className='mb-3 w-sm text-md h-10 bg-[#222222] text-white border-gray-300 rounded-md hover:bg-gray-800'
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
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {(activeFilter === 'all' || activeFilter === 'video') && videoPackages.length > 0 && (
                    <>
                        <motion.h3 
                            variants={itemVariants}
                            className='text-center font-bold text-xl md:text-2xl pb-6'
                        >
                            Video Packages
                        </motion.h3>
                        <div className='max-w-4xl mx-auto py-2 '>
                            {videoPackages.map((pkg) => (
                                <motion.div 
                                    key={pkg.id}
                                    variants={packageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    className="flex flex-col md:flex-row mx-auto gap-10 px-6 mb-10 py-6 bg-[#e9e9e9] shadow-lg rounded-lg"
                                >
                                    <div className='w-[500px] h-[440px] px-auto md:px-6 mt-1 items-center justify-center overflow-hidden'>
                                        <motion.img 
                                            src={pkg.image} 
                                            className='mt-[-40px]'
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        />
                                    </div>
                                    <div className=''>
                                        <h3 className="text-[#272727] pt-7 text-3xl font-bold">{pkg.package_name}</h3>
                                        <p className="py-2 text-[#272727] text-lg mb-3">{pkg.description}</p>
                                        <ul className="list-disc list-inside text-lg text-gray-600">
                                            {pkg.deliverables.split(",").map((item, index) => (
                                                <li key={index}>{item.trim()}</li>
                                            ))}
                                        </ul>
                                        <p className="text-gray-800 font-bold mb-2 py-6">
                                            ₦{parseFloat(pkg.price).toLocaleString()}
                                            {pkg.is_popular && (
                                                <motion.span 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="mx-3 inline-block bg-[#d9b683] text-white text-xs px-5 py-1 rounded-full"
                                                >
                                                    Popular
                                                </motion.span>
                                            )}
                                        </p>
                                        <motion.button 
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                            className='mb-3 w-sm text-md h-10 bg-[#222222] text-white border-gray-300 rounded-md hover:bg-gray-800'
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
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {(activeFilter === 'all' || activeFilter === 'combo') && comboPackages.length > 0 && (
                    <>
                        <motion.h3 
                            variants={itemVariants}
                            className='text-center font-bold text-xl md:text-2xl pb-6'
                        >
                            Photo and Video Combo Packages
                        </motion.h3>
                        <div className='max-w-4xl mx-auto py-2 '>
                            {comboPackages.map((pkg) => (
                                <motion.div 
                                    key={pkg.id}
                                    variants={packageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    className="flex flex-col md:flex-row mx-auto gap-10 px-6 mb-10 py-6 bg-[#e9e9e9] shadow-lg rounded-lg"
                                >
                                    <div className='w-[500px] h-[440px] px-auto md:px-6 mt-1 items-center justify-center overflow-hidden'>
                                        <motion.img 
                                            src={pkg.image} 
                                            className='mt-[-40px]'
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        />
                                    </div>
                                    <div className=''>
                                        <h3 className="text-[#272727] pt-7 text-3xl font-bold">{pkg.package_name}</h3>
                                        <p className="py-2 text-[#272727] text-lg mb-3">{pkg.description}</p>
                                        <ul className="list-disc list-inside text-lg text-gray-600">
                                            {pkg.deliverables.split(",").map((item, index) => (
                                                <li key={index}>{item.trim()}</li>
                                            ))}
                                        </ul>
                                        <p className="text-gray-800 font-bold mb-2 py-6">
                                            ₦{parseFloat(pkg.price).toLocaleString()}
                                            {pkg.is_popular && (
                                                <motion.span 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="mx-3 inline-block bg-[#d9b683] text-white text-xs px-5 py-1 rounded-full"
                                                >
                                                    Popular
                                                </motion.span>
                                            )}
                                        </p>
                                        <motion.button 
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                            className='mb-3 w-sm text-md h-10 bg-[#222222] text-white border-gray-300 rounded-md hover:bg-gray-800'
                                            onClick={() => {
                                                localStorage.setItem('order', pkg.id)
                                                setBooking(JSON.stringify(pkg));
                                                console.log('order is '+localStorage.getItem('order'));
                                                user ? navigate('/dashboard/new-booking') : navigate('/login')
                                            }}
                                        >
                                            Book Now
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>

            <Footer />
        </>
    )
}

export default Pricing