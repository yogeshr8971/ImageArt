import React, { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import Navbar from './components/Navbar'
// import Footer from './components/Footer'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Bg from './components/Bg'
import Object from './components/Object'
import Uncrop from './components/Uncrop'
import { AppContext } from './context/AppContext'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const {showLogin} = useContext(AppContext)
  return (
    <div className='px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradient-to-b bg-[#dff7f7] to-pink-50'>
      <ToastContainer />
      <Navbar />
      {showLogin && <Login />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/result' element={<Result />} />
        <Route path='/buy' element={<BuyCredit />} />
        <Route path='/Bg' element={<Bg/>} />
        <Route path='/Object' element={<Object/>} />
        <Route path='/Uncrop' element={<Uncrop/>} />
      </Routes>
      {/* <Footer/> */}

    </div>
  )
}

export default App
