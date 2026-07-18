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
import Stats from './Pages/Stats.jsx'
import SentenceDictation from './Pages/SentenceDictation.jsx'
import Reading from './Pages/Reading.jsx'
import FIB from './Pages/FIB.jsx'
import Dictation from './Pages/Dictation.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
    <Routes>
      <Route path="/characterbank" element={<Characterlist />} />
      <Route path="/start" element={<Start />} />
      <Route path="/practicelogging" element = {<PracticeLogging />} />
      <Route path="/stats" element = {<Stats />} />
      <Route path="/sentencedictation" element = {<SentenceDictation/>} />
      <Route path="/reading" element = {<Reading />} />
      <Route path="/practice" element = {<Practice />} />
      <Route path="/fib" element = {<FIB />} />
      <Route path="/dictation" element = {<Dictation />} />
    </Routes>
    </>
    
  )
}
export default App
