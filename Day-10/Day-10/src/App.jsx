import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import {Routes} from "./assets/Pages/Home.jsx"
import{BrowserRouter} from "react-router-dom"
import Home from './pages/Home'
import StudentInfo from './data/Students.js'
import { NavLink } from 'react-router-dom'
import StudentDetails from './pages/StudentDetail.jsx'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
      <nav>
        <NavLink to="/">Home</NavLink>
        

        <NavLink to="/student">StudenetDetails</NavLink>

      </nav>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/student" element={<StudentDetails/>}/>
        <Route path="/student/:id" element={<StudentDetails/>}/>
      </Routes>
    </div>
    </>
  )
}

export default App
