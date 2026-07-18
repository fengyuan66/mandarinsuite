import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
//components import
import Header from "./Components/Header.jsx"
//pages import
import Characterlist from "./Pages/Characterlist.jsx"
import Start from "./Pages/Start.jsx"

import Practice from "./Pages/PracticeLogging.jsx"
import PracticeLogging from './Pages/PracticeLogging.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
    <Routes>
      <Route path="/characterbank" element={<Characterlist />} />
      <Route path="/start" element={<Start />} />
      <Route path="/practicelogging" element = {<PracticeLogging />} />
    </Routes>
    </>
    
  )
}
export default App
