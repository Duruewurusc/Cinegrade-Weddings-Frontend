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
import ImageSlider from '../components/StaticImageSlider'
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
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
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
                className="relative h-150 md:h-200 w-full overflow-hidden"
            >
                <img 
                    src={bannerImage} 
                    alt="Gallery Banner" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/100 bg-opacity-40  py-5 z-0">
                    <div className='absolute bottom-30 md:bottom-40 right-0 left-0 flex flex-col items-center justify-center'>
                    <h1 className="font-serif font-bold text-2xl md:text-6xl lg:text-7xl  tracking-tight text-white mb-4">Packages & Pricing</h1> 
                    <p className="px-4 text-sm md:text-xl text-[#e0e0e0] text-center">Affordable Wedding Photgraphy and Videography pricing</p></div>
                </div>
                
            </motion.div>

            <div className="pt-10 ">
                {/* <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='text-[#5f5f5f] font-serif font-medium text-4xl md:text-5xl text-center mb-4'
                >
                    Packages & Pricing
                </motion.h2> */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='text-[#5e5e5e] w-90 md:w-250 xl:w-300 text-sm md:text-xl text-left mb-4 py-1 md:py-10 px-4 mx-auto'
                >
                At CineGRADE Weddings, we offer customizable wedding photography and videography packages for every budget—from intimate elopements 
                to grand celebrations. Whether you need photos, video, or both, our affordable wedding photo and video packages ensure every moment
                 is beautifully captured.
                </motion.p>
                
               <ImageSlider/>
                {/* Filter buttons */}
                <motion.div 
                    variants={filterVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 px-4 pt-12"
                >
                    {[ 'photo', 'video', 'combo'].map((filterType) => (
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
                className='w-full '
            >
                {(activeFilter === 'all' || activeFilter === 'photo') && photoPackages.length > 0 && (
                    <>
                <motion.h3 
                     variants={itemVariants}
                            className='text-center font-bold text-xl md:text-4xl pb-15'
                        >
                            Photography Packages
                </motion.h3>
                <div className='w-full py-10 px-2 md:px-15 bg-[#f3f3f3]'>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {photoPackages.map((pkg) => (
                            <motion.div 
                                key={pkg.id}
                                variants={packageVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                className="flex flex-col bg-transparent overflow-hidden h-full shadow-sm"
                            >
                                <div className='relative h-100 overflow-hidden rounded-t-2xl'>
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
                                    <p className="font-serif py-2 text-gray-800 text-lg mb-3">{pkg.description}</p>
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
                )}

                {(activeFilter === 'all' || activeFilter === 'video') && videoPackages.length > 0 && (
                    <>
                        <motion.h3 
                            variants={itemVariants}
                            className='font-serif text-center font-bold text-xl md:text-4xl pb-15'
                        >
                            Videography Packages
                        </motion.h3>
                        {/* <div className='max-w-4xl mx-auto py-2 '>
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
                        </div> */}
                        <div className='w-full py-10 px-2 md:px-15 bg-[#f3f3f3]'>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {videoPackages.map((pkg) => (
                            <motion.div 
                                key={pkg.id}
                                variants={packageVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                className="flex flex-col bg-transparent overflow-hidden h-full shadow-sm"
                            >
                                <div className='relative h-100 overflow-hidden rounded-t-2xl'>
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
                                    <p className="font-serif py-2 text-gray-800 text-lg mb-3">{pkg.description}</p>
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
                )}

                {(activeFilter === 'all' || activeFilter === 'combo') && comboPackages.length > 0 && (
                    <>
                        <motion.h3 
                     variants={itemVariants}
                            className='font-serif text-center font-bold text-xl md:text-4xl pb-15'
                        >
                            Photo and Video Packages
                </motion.h3>
                <div className='w-full py-10 px-2 md:px-15 bg-[#f3f3f3]'>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {comboPackages.map((pkg) => (
                            <motion.div 
                                key={pkg.id}
                                variants={packageVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                className="flex flex-col bg-transparent overflow-hidden h-full shadow-sm"
                            >
                                <div className='relative h-100 overflow-hidden rounded-t-2xl'>
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
                                    <p className="font-serif py-2 text-gray-800 text-lg mb-3">{pkg.description}</p>
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
                )}
            </motion.div>

            
                {/* Terms and Conditions Section */}
                <div className="max-w-6xl mx-auto  px-4 py-15">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-6  "
                    >
                        <h3 className="text-2xl md:text-4xl font-bold text-[#d9b683] mb-4 text-center">Terms & Conditions</h3>
                        <div className=" space-y-3 py-6 text-sm md:text-xl text-[#5e5e5e] w-full">
                            <p><strong>Booking & Reservation:</strong> A non-refundable deposit of 50% is required to secure your booking date. The remaining balance is due 14 days prior to your event.</p>
                            <p><strong>Cancellation Policy:</strong> In the event of cancellation, the deposit is non-refundable. Cancellations made less than 30 days before the event will incur 100% of the package cost.</p>
                            <p><strong>Rescheduling:</strong> Clients may reschedule once without penalty if notice is provided at least 30 days prior to the original event date, subject to availability.</p>
                            <p><strong>Delivery Time:</strong> Final edited photos/videos will be delivered within 4-8 weeks after the event. Rush delivery may be available for an additional fee.</p>
                            <p><strong>Copyright:</strong> The photographer/videographer retains copyright of all images/videos while granting the client permission to reproduce and share images/videos.</p>
                            <p><strong>Liability:</strong> In the unlikely event of equipment failure, illness, or other circumstances beyond our control, liability is limited to a full refund of all payments received.</p>
                            <p><strong>Additional Expenses:</strong> Any additional expenses incurred during the assignment (travel, accommodation, etc.) will be charged to the client.</p>
                            <p><strong>Creative License:</strong> The photographer/videographer reserves the right to use discretion regarding editing and processing of final images/videos.</p>
                        </div>
                    </motion.div>
                </div>

            <Footer />
        </>
    )
}

export default Pricing