

import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { delay, motion } from "motion/react"
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {

  const {user, setShowLogin} = useContext(AppContext)
  const navigate = useNavigate()

  const onClickHandler =() => {
    if (user) {
      navigate('/result')
    }else{
      setShowLogin(true)
    }
  }
  return (
    <motion.div className=' flex flex-col justify-center items-center text-center my-8'
    initial={{opacity:0.2, y:100}}
    transition={{duration:1}}
    whileInView={{opacity:1, y:0}}
    viewport={{once:true}}>
      <motion.div className=' inline-flex text-center gap-2 bg-gradient-to-r from-blue-600 to-green-300 text-white px-6 py-1 rounded-full border hover:scale-105 border-neutral-500 transition-all duration-700'
      initial={{opacity:0, y:-20}}
      animate={{opacity:1, y:0}}
      viewport={{delay:0.2, duration:0.8}}>
        <p>Type your vision and let AI bring it to life — generate mesmerizing images,
       remove backgrounds, or erase unwanted objects effortlessly.</p>
        <img src={assets.star_icon} alt=''/>
      </motion.div>
      <motion.h1 className='text-4xl max-w-[700px] sm:text-6xl sm:max-w-[600px] mx-auto mt-5 text-center'>from your imagination into stunning visuals <span className='text-red-600 font-bold'
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{delay:0.4,duration:2}}
      > and AI editing </span> instantly</motion.h1>


      <motion.button onClick={onClickHandler} className='sm:text-lg text-white bg-pink-700 w-auto mt-4 px-12 py-2.5 flex items-center gap-2 rounded-full'
      whileHover={{scale:1.05}}
      whileTap={{scale:0.95}}
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{default: {duration:0.5}, opacity: {delay:0.8, duration: 1}}}
      >
        Generate & Edit Images
        <img className='h-6' src={assets.star_group} alt=''/>
      </motion.button>
     
    </motion.div>
  )
}

export default Header



// ======================================================================

