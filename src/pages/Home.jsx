import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/hero'
import HomeCard from '../components/HomeCard'
import Testimonials from '../components/Testimonials'
import Stats from '../components/Stats'
import WhatWeDo from '../components/WhatWeDo'
import Footer from '../components/Footer'
import WhyUs from '../components/WhyUs'
import CTA from '../components/CTA'
import WeddingFAQ from '../components/FAQ'
import Gallery from './Gallery'
import ImageSlider from '../components/Imageslider'

const Home = () => {
  return (
    <>
    <nav>
      <Navbar/>
    </nav>
    <div>
    <Hero/>
    <HomeCard/>
     <Stats/>
    <ImageSlider/>
    <WhatWeDo/>
    <Testimonials/>
   
   
    <CTA/>
    {/* <WhyUs/> */}
    <WeddingFAQ/>
    <Footer/>
    </div>
    </>
  )
}

export default Home