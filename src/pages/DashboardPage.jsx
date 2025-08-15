import React from 'react'
import Dashboard from '../components/Dashboard'
import DashboardLayout from '../components/dashboardLayout'
import Navbar from '../components/Navbar'

const DashboardPage = () => {
    console.log(localStorage.getItem('access'))
  return (
    <>
    <Navbar/>
    <DashboardLayout/>
    </>
    
  )
}

export default DashboardPage