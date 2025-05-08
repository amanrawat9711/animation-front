import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './Header'
import AnimationPanel from './AnimationPanel'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Header/>} />
        <Route path='/animation' element={<AnimationPanel/>} />
      </Routes>
    </div>
  )
}

export default App