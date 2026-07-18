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
import Login from './Pages/Login.jsx'
import Register from './Pages/Register.jsx'


import { Navigate } from "react-router-dom";
import { useAuth } from "./common/AuthContext.jsx";

function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/characterbank" element={<RequireAuth><Characterlist /></RequireAuth>} />
      <Route path="/start" element={<RequireAuth><Start /></RequireAuth>} />
      <Route path="/practicelogging" element={<RequireAuth><PracticeLogging /></RequireAuth>} />
      <Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} />
      <Route path="/sentencedictation" element={<RequireAuth><SentenceDictation/></RequireAuth>} />
      <Route path="/reading" element={<RequireAuth><Reading /></RequireAuth>} />
      <Route path="/practice" element={<RequireAuth><Practice /></RequireAuth>} />
      <Route path="/fib" element={<RequireAuth><FIB /></RequireAuth>} />
      <Route path="/dictation" element={<RequireAuth><Dictation /></RequireAuth>} />
    </Routes>
    </>
    
  )
}
export default App
