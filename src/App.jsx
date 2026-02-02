import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Gallery from './pages/Gallery'

import { useState } from 'react'
import './App.css'
import Login from './pages/Login';
import Home from './pages/Home';
import Pricing from './pages/Pricing';

import ClientBookingPage from './pages/ClientBookingPage';
import EditBookingPage from './pages/EditBookingPage';
import Invoice from './pages/Invoice';
import ClientPaymentsViewPage from './pages/ClientPaymentsViewPage';
import ClientList from './pages/ClientListPage';
import ReceiptPage from './pages/ReceiptPage';
import NewBookingPage from './pages/NewBookingPage';
import { UserProvider } from './services/UserContext';
import CustomerProfile from './pages/CustomerProfile';
import AboutPage from './pages/AboutUs';
import BookingManagement from './pages/Up Coming Event';
import CreateClient from './pages/NewClientAdd';
import ViewEditBooking from './pages/ViewBooking';
import AdminDashboard from './pages/Analytics';
import Blog from './pages/Blog';
import LinksPage from './pages/Links';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import PaymentForm from './pages/PaymentForm';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home/>}></Route>
          <Route path="/gallery" element={<Gallery/>}></Route>
          <Route path="/pricing" element={<Pricing/>}></Route>
          <Route path="/pricing/:category" element={<Pricing />} />
          <Route path="/aboutus" element={<AboutPage/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/blog" element={<Blog/>}></Route>
          <Route path="/forgot-password" element={<ForgotPassword/>}></Route>
          <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />}/>

          <Route path="/dashboard/upcoming-events" element={<BookingManagement />}></Route>
          <Route path="/dashboard/new-booking" element={<NewBookingPage />}></Route>
          <Route path="/dashboard/profile" element={<CustomerProfile/>}></Route>
          <Route path="/dashboard/bookings" element={<ClientBookingPage/>}></Route>
          <Route path="/dashboard/bookings/:id" element={<ViewEditBooking/>}></Route>
          <Route path="/dashboard/clientlist" element={<ClientList/>}></Route>
          <Route path="/dashboard/clientlist/new" element={<CreateClient/>}></Route>
          <Route path="/dashboard/clientlist/:id" element={<CustomerProfile/>}></Route>

          <Route path="/dashboard/add-payment" element={<PaymentForm/>}></Route>
          <Route path="/dashboard/payments" element={<ClientPaymentsViewPage/>}></Route>
          <Route path="/dashboard/invoice/:id" element={<Invoice/>}></Route>
          <Route path="/bookings/edit/:id" element={<EditBookingPage />} />
          <Route path="/dashboard/receipt/:id" element={<ReceiptPage/>}></Route>
          <Route path="/dashboard/analytics" element={<AdminDashboard/>}></Route>
          <Route path="/dashboard/links" element={<LinksPage/>}></Route>
          
        </Routes>
      </BrowserRouter>
      </UserProvider>



    </>

  )
  

  
}

export default App
