import React from 'react';
import { FaUserTie, FaCamera, FaBriefcase } from 'react-icons/fa';
import { HiFilm } from "react-icons/hi";

const Stats = () => {
  return (
    <div className="w-full  mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-[#ffffff] to-[#e9e9e9]">
      {/* <div className='bg-[#ebcea4] hidden md:block w-sm md:w-xs h-1 mx-auto mb-15'></div> */}
      <div className="mx-auto grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-7xl">
        {/* Stat 1 - Weddings Captured */}
        <div className="flex flex-col items-center text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ebcea4] flex items-center justify-center mb-3 sm:mb-4">
            <FaCamera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#242424]">123+</h1>
          <p className="text-sm sm:text-base md:text-lg text-[#242424] mt-1">Weddings Captured</p>
        </div>

        {/* Stat 2 - Wedding Films */}
        <div className="flex flex-col items-center text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ebcea4] flex items-center justify-center mb-3 sm:mb-4">
            <HiFilm className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#242424]">80+</h1>
          <p className="text-sm sm:text-base md:text-lg text-[#242424] mt-1">Wedding Films Created</p>
        </div>

        {/* Stat 3 - Client Rating */}
        <div className="flex flex-col items-center text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ebcea4] flex items-center justify-center mb-3 sm:mb-4">
            <FaUserTie className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#242424]">4.9/5</h1>
          <p className="text-sm sm:text-base md:text-lg text-[#242424] mt-1">Client Rating</p>
        </div>

        {/* Stat 4 - Experience */}
        <div className="flex flex-col items-center text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ebcea4] flex items-center justify-center mb-3 sm:mb-4">
            <FaBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#242424]">10+</h1>
          <p className="text-sm sm:text-base md:text-lg text-[#242424] mt-1">Years of Experience</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;