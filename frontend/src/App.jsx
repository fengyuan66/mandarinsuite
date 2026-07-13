import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
//components import
import Header from "./Components/Header.jsx"
//pages import
import Characterlist from "./Pages/Characterlist.jsx"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
    <Routes>
      <Route path="/characterbank" element={<Characterlist />} />
    </Routes>
    </>
    
  )
}
export default App
