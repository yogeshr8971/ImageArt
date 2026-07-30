
import React from 'react'
import Header from '../components/Header'

import Description from '../components/Description'
import GenerateBtn from '../components/GenerateBtn'
import Slider from '../components/Slider'

const Home = () => {
  return (
    <div>
      <Header/>
      <Slider/>
      <Description />
      <GenerateBtn />
    </div>
  )
}

export default Home
