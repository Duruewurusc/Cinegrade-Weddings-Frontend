import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCamera, FaUserSecret, FaBoxOpen } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import aboutImage from '../assets/cgw banner.jpg'; // Placeholder for team image
import dscpix from '../assets/dscpix.jpg';
import abtus1 from '../assets/abtus1.jpg';
import abtus2 from '../assets/abtus2.jpg';

import { FiCamera, FiFilm, FiHeart, FiAward, FiMail, FiPhone, FiMapPin, FiUsers, FiStar, FiDollarSign } from "react-icons/fi";


const AboutUs = () => {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      {/* Hero Banner with Dark Gradient Overlay */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-black/40"
          style={{
            backgroundImage: `url(${aboutImage})` ,
            backgroundPosition: 'center 20%'
          }}
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/10 via-neutral-900/70 to-neutral-900/90" />
        <div className="relative z-10 text-center px-4">

          <h1 className="text-8xl md:text-7xl font-serif font-light tracking-wide mb-4 text-gray-50">
            About Us
          </h1>
          {/* <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Capturing timeless moments that tell your unique love story
          </p> */}
        </div>
      </section>

      {/* Creative Director Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden  border-neutral-800">
                <img
                  src={dscpix}
                  alt="Creative Director"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <FiAward className="w-8 h-8 text-[#d9b684]" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-400">
                
                <span className="text-sm uppercase tracking-widest">Creative Director</span>
              </div>
              <h2 className="text-4xl font-serif font-light text-neutral-900">
                Duruewuru Chukwuemeka
              </h2>
              <div className="w-16 h-px bg-[#d9b684]/50" />
              <p className="text-gray-400 leading-relaxed">
                "Every love story deserves to be told with authenticity and artistry. 
                With over 15 years behind the lens, I've had the privilege of documenting 
                hundreds of beautiful unions. My philosophy is simple: be present, be invisible, 
                and capture the raw, unscripted moments that make your day uniquely yours."
              </p>
              <p className="text-gray-400 leading-relaxed">
                "I founded this studio with a vision to create more than just photographs 
                and films—I wanted to craft heirlooms that would be treasured for generations. 
                Every frame we capture is a testament to the love, laughter, and tears of joy 
                that make weddings so extraordinary."
              </p>
              <div className="flex items-center gap-4 pt-4">
                <FiHeart className="w-5 h-5 text-[#d9b684]" />
                <span className="text-sm text-gray-400 italic">
                  "Love is the poetry of the senses"
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 px-4 bg-neutral-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-light text-gray-50 mb-4">
              Our Approach
            </h2>
            <div className="w-24 h-px bg-[#d9b684]/50 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-800/70 p-8 rounded-lg border border-neutral-700 text-center group hover:border-[#d9b684]/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d9b684]/10 transition-colors border border-neutral-700">
                <FiCamera className="w-8 h-8 text-[#d9b684]" />
              </div>
              <h3 className="text-xl font-medium text-gray-50 mb-4">Documentary Style</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We believe in capturing genuine moments as they unfold naturally. 
                No forced poses, just authentic emotions and candid interactions 
                that tell the true story of your day.
              </p>
            </div>
            <div className="bg-neutral-800/70 p-8 rounded-lg border border-neutral-700 text-center group hover:border-[#d9b684]/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d9b684]/10 transition-colors border border-neutral-700">
                <FiFilm className="w-8 h-8 text-[#d9b684]" />
              </div>
              <h3 className="text-xl font-medium text-gray-50 mb-4">Cinematic Vision</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our films are crafted with a cinematic eye, utilizing professional 
                equipment and techniques to create wedding films that feel like 
                feature productions.
              </p>
            </div>
            <div className="bg-neutral-800/70 p-8 rounded-lg border border-neutral-700 text-center group hover:border-[#d9b684]/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d9b684]/10 transition-colors border border-neutral-700">
                <FiHeart className="w-8 h-8 text-[#d9b684]" />
              </div>
              <h3 className="text-xl font-medium text-gray-50 mb-4">Personal Touch</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We take the time to understand your story, your style, and your vision. 
                Every wedding is unique, and our approach reflects that individuality 
                in every frame.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 px-4 bg-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif font-light text-gray-50">
                Who We Are
              </h2>
              <div className="w-16 h-px bg-[#d9b684]/50" />
              <p className="text-gray-400 leading-relaxed">
                We are a passionate team of photographers, videographers, and 
                storytellers united by a shared love for capturing life's most 
                precious moments. Based in the heart of the city, we travel 
                worldwide to document love stories in all their beautiful forms.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Our team brings together diverse perspectives and expertise, 
                from fine art photography to documentary filmmaking. This blend 
                of skills allows us to offer a comprehensive approach to wedding 
                coverage that is both artistic and authentic.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-50">500+</div>
                  <div className="text-sm text-gray-400">Weddings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-50">15+</div>
                  <div className="text-sm text-gray-400">Years</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-50">50+</div>
                  <div className="text-sm text-gray-400">Countries</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border border-neutral-800">
                  <img
                    src={abtus1}
                    alt="Team at work"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] rounded-lg overflow-hidden mt-8 border border-neutral-800">
                  <img
                    src={abtus2}
                    alt="Behind the scenes"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-700">
                  <FiUsers className="w-8 h-8 text-[#d9b684]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FiHeart className="w-12 h-12 text-[#d9b684] mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-serif font-light text-neutral-900 mb-4">
            Ready to Document Your Wedding?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Let us be a part of your special day. We'd love to hear about your 
            love story and discuss how we can capture it beautifully.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="px-8 py-4 bg-[#d9b684] text-neutral-900 font-medium rounded-lg hover:bg-amber-600 transition-colors duration-300 flex items-center gap-2">
              <FiMail className="w-5 h-5" />
              Contact Us
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-[#d9b684]/50 text-[#d9b684] font-medium rounded-lg hover:bg-[#d9b684]/10 transition-colors duration-300 flex items-center gap-2">
              <FiDollarSign className="w-5 h-5" />
              View Pricing
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <FiMapPin className="w-4 h-4 text-[#d9b684]" />
            <span className="text-sm">Available for destination weddings worldwide</span>
          </div>
        </div>
      </section>
      <Footer/>

      {/* Footer */}
      {/* <footer className="py-8 px-4 bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FiCamera className="w-5 h-5 text-[#d9b684]" />
            <FiFilm className="w-5 h-5 text-[#d9b684]" />
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Wedding Stories Studio. All rights reserved.
          </p>
        </div>
      </footer> */}
    </div> </>
  );
};

export default AboutUs;