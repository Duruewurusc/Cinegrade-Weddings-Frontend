import React from 'react'
import { FaBoxOpen, FaEnvelope } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const CTA = () => {
  const navigate= useNavigate()
  return (
          
        <div className="mt-24 p-10 relative overflow-hidden bg-[#f7f7f7]">
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[length:30px_30px]"></div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl text-[#252525] font-serif font-bold mb-6">Ready to Capture Your Love Story?</h2>
            <p className="text-xl text-[#d9b683] mb-8">
              Let's capture it in stunning detail!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={()=>navigate('/pricing')} className="px-8 py-4 bg-[#222222] text-white rounded-lg hover:opacity/80 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 flex items-center justify-center">
                <FaBoxOpen className="mr-2" />
                See our packages
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-black text-black rounded-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 flex items-center justify-center">
                <FaEnvelope className="mr-2" />
                Contact us
              </button>
            </div>
          </div>
        </div>


  )
}

export default CTA