import React from 'react'
import AdaImage from "../assets/ada.jpg"


const usp = [
    { id: 1,
      title: "Regardless of the situaltion we always deliver"},
    {  id: 2,
     title: "We are Approachable and we listen"},
    {  id: 3,
      title: "We are professional and never show up late"}
    
  ];

const WhyUs = () => {
  return (
    <>
    <div className='flex flex-col md:flex-row gap-10 mx-auto justify-center py-11 bg-[#f7f7f7] px-7'>
        
        <div className='w-2xl px-15 pt-10'>
            <h2 className='text-4xl text-[#666666]'>"Why Choose Us?"</h2>
        
            {/* <h3 className='pt-9 pb-4 font-bold text-2xl'>What We Offer</h3> */}

            <ul>
                {usp.map((serviceList) => (
            
                <li><div>
                    <h3 className="text-lg font-medium text-gray-900">{serviceList.title}</h3>
                    
                </div></li>
            
        
            ))}
            </ul>

        </div>
        <div className='w-2xl'> 
            <img src={AdaImage}></img>
        </div>
    </div>


    
    <div className='flex flex-col py-9 items-center px-4 '>
        <div className='text-center'>
            <h1 className='text-4xl py-5'>Finally</h1>
            <p className='text-2xl'>Your wedding day is once in a lifetime -  Lets capture it in stunning detail !</p>
        </div>
        

        <div className='py-4'>
        <button className='h-11 text-lg px-4 bg-[#242424] rounded-md mx-3 text-white' >See our packages</button>
        <button className='h-11 text-lg px-4 border border-solid border-gray-300 rounded-md'>Contact us</button>
        </div>
    </div>
    </>
  )
}

export default WhyUs