import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useUser } from '../services/UserContext';
import bannerImage from '../assets/funeral.jpg'
import { fetchPackage} from '../services/Api'
import ImageSlider from '../components/StaticImageSlider'

import Image1 from '../assets/burial/img-1.jpg';
import Image2 from '../assets/burial/img-13.jpg';
import Image3 from '../assets/burial/img-14.jpg';
import Image4 from '../assets/burial/img-5.jpg';
import Image5 from '../assets/burial/img-7.jpg';
import Image6 from '../assets/burial/img-12.jpg';
import Image7 from '../assets/burial/img-9.jpg';
import Image8 from '../assets/burial/img-11.jpg';
import Image9 from '../assets/burial/img-12.jpg';

const burialImages = [
  { id: 1, src: Image1, alt: "Gallery image 1" },
      { id: 2, src: Image2, alt: "Gallery image 2" },
      { id: 3, src: Image3, alt: "Gallery image 3" },
      { id: 4, src: Image4, alt: "Gallery image 4" },
      { id: 5, src: Image5, alt: "Gallery image 5" },
      { id: 6, src: Image6, alt: "Gallery image 6" },
      { id: 7, src: Image7, alt: "Gallery image 6" },
      { id: 8, src: Image8, alt: "Gallery image 6" },
      { id: 9, src: Image9, alt: "Gallery image 6" },
];


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

const BurialPage = () => {
    const navigate = useNavigate()
    
    const [searchParams, setSearchParams] = useSearchParams()
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { booking, setBooking } = useUser()
    const { user } = useUser()
    
    // Get category from URL or default to 'all'
    const urlCategory = searchParams.get('category') || 'combo'
    const [activeFilter, setActiveFilter] = useState(urlCategory)

    // Filter packages
    const photoPackages = packages.filter(pkg => pkg.category === 'photo' && pkg.event_type === 'burial')
    const videoPackages = packages.filter(pkg => pkg.category === 'video' && pkg.event_type === 'burial')
    const comboPackages = packages.filter(pkg => pkg.category === 'combo' && pkg.event_type === 'burial')
    const allPackages = packages.filter(pkg => pkg.event_type === 'burial')


    // Update active filter when URL changes
    useEffect(() => {
        setActiveFilter(urlCategory)
    }, [urlCategory])

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
    }, [])

    const handleFilterChange = (filterType) => {
        setActiveFilter(filterType)
        // Update URL without navigation
        if (filterType === 'all') {
            searchParams.delete('category')
        } else {
            searchParams.set('category', filterType)
        }
        setSearchParams(searchParams, { replace: true })
    }

    // Helper function to get packages to display
    const getPackagesToDisplay = () => {
        switch(activeFilter) {
            case 'photo':
                return photoPackages
            case 'video':
                return videoPackages
            case 'combo':
                return comboPackages
            case 'all':
            default:
                return allPackages // Return all packages
        }
    }

    // Helper function to get section title
    const getSectionTitle = () => {
        switch(activeFilter) {
            case 'photo':
                return 'Photography Packages'
            case 'video':
                return 'Videography Packages'
            case 'combo':
                return 'Photo and Video Packages'
            case 'all':
            default:
                return 'All Packages'
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
                </div>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Navbar />
                <motion.p 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#d4bf9f] text-white px-4 py-3 rounded relative p-4 max-w-4xl mx-auto mt-8" 
                    role="alert"
                >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </motion.p>
            </>
        )
    }

    const packagesToDisplay = getPackagesToDisplay()
    const sectionTitle = getSectionTitle()

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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/100 bg-opacity-40 py-5 z-0">
                    <div className='absolute bottom-30 md:bottom-40 right-0 left-0 flex flex-col items-center justify-center'>
                        <h1 className="font-serif font-bold text-2xl md:text-6xl lg:text-7xl tracking-tight text-white mb-4">Burial Packages & Pricing</h1> 
                        <p className="px-4 text-sm md:text-xl text-[#e0e0e0] text-center">Premium Funeral Photography and Videography pricing</p>
                    </div>
                </div>
            </motion.div>

            <div className="pt-10">
                <h2 className='text-[#2e2e2e] text-xl md:text-4xl font-bold text-center mb-4'>Our Deepest Condolences ...</h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='text-[#5e5e5e] w-90 md:w-250 xl:w-300 text-sm md:text-xl text-left mb-4 py-1 md:py-10 px-4 mx-auto'
                >
                    We extend our heartfelt condolence to you and your family during this time of loss. At CineGRADE VISUALS, we believe every farewell
                    deserves to be remembered with love, respect and honour. <br /><br />
                    With over 10yrs experience in professional photography and cinematography, our team is dedicated to capturing every significant 
                    detail — from the quiet moments of reflection to the heartfelt tributes of family and friends. We work discreetly and respectfully, ensuring that your loved one’s legacy is beautifully documented.
                </motion.p>
                
                <ImageSlider images={burialImages} />
                
                {/* Filter buttons */}
                <motion.div 
                    variants={filterVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 px-4 pt-12"
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

            {/* Packages Display */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className='w-full'
            >
                {packagesToDisplay.length > 0 ? (
                    <>
                        <motion.h3 
                            variants={itemVariants}
                            className='text-center font-bold text-xl md:text-4xl pb-15'
                        >
                            {sectionTitle}
                        </motion.h3>
                        
                        <div className='w-full py-10 px-2 md:px-15 bg-[#f3f3f3]'>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                                {packagesToDisplay.map((pkg) => (
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
                                            />
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
                                            <p className=" font-bold py-2 text-[#4d4d4d] text-lg mb-3">{pkg.description}</p>
                                            <ul className="list-disc list-inside text-base text-gray-700 flex-grow space-y-2">
                                                {pkg.deliverables.split(",").map((item, index) => (
                                                    <li key={index} className=" text-sm">{item.trim()}</li>
                                                ))}
                                            </ul>
                                            <div className="mt-6">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className='w-full text-lg h-12 bg-[#222222] text-white border-gray-300 rounded-xl hover:bg-gray-800 font-bold'
                                                    onClick={() => {
                                                        localStorage.setItem('order', pkg.id)
                                                        setBooking(JSON.stringify(pkg))
                                                        console.log('order is' + localStorage.getItem('order'))
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
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <h3 className="text-2xl font-bold text-gray-600 mb-4">No packages found</h3>
                        <p className="text-gray-500">There are no packages available for the selected category.</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Terms and Conditions Section */}
            <div className="max-w-6xl mx-auto px-4 py-15">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6"
                >
                    <h3 className="text-2xl md:text-4xl font-bold text-[#d9b683] mb-4 text-center">Terms OF Service</h3>
                    <div className="space-y-3 py-6 text-sm md:text-xl text-[#5e5e5e] w-full">
                        <p>We sincerely appreciate your time in reviewing our packages. At <strong>CineGRADE VISUALS</strong>, it is our honor to help families preserve memories through photography and film.
                            We look forward to working with you. Please feel free to reach out to us at any time for further clarification,questions, or custom requests — we are always here to serve you.<br/><br/></p>
                        <p><strong>Booking & Reservation:</strong> A non-refundable deposit of 70% is required to secure your booking date. The remaining balance is due immediately after your event.</p>
                        <p><strong>Cancellation Policy:</strong> In the event of cancellation, the deposit is non-refundable. </p>
                        <p><strong>Rescheduling:</strong> Clients may reschedule once without penalty if notice is provided at least 30 days prior to the original event date, subject to availability. A 20% fee applies for rescheduling less than 30 days prior to the event date.</p>
                        <p><strong>Delivery Time:</strong> Quick preview pictures – 20+ edted Images within 1 week after the event. <br/>
                                    Highlight video – within 2 weeks after the event. <br/>
                                    Complete event products (all photos & full video) – within 4-6 weeks after the event. <br/>
                                    The complete products are to be picked up at our office in Enugu. Additional cost aplies for Waybill delivery.
                                    Rush delivery may be available for an additional fee.</p>
                        <p><strong>Photobooks:</strong> Where photobooks are included, the photo album design will be sent to the client for proofing before production. Once approved and printing is done, Any other correction attracts an Extra fee.</p>
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

export default BurialPage