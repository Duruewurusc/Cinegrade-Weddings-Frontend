import React from 'react'
import Navbar from '../components/Navbar'

const Blog = () => {
  return (
    <div>
        <Navbar/>

        <h1 className='text-4xl text-center py-10'>Blog</h1>
        <div className='max-w-4xl mx-auto px-4'>
            <p className='text-lg text-gray-700'>Welcome to our blog! Here you will find the latest news, tips, and stories from our team.</p>
            <p className='text-lg text-gray-700 mt-4'>Stay tuned for updates on our projects, behind-the-scenes insights, and more!</p>
        </div>
    </div>
  )
}

export default Blog