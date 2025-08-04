import IntroPage from './IntroPage.jsx'
import LoginPage from './LoginPage.jsx'
import RegistrationPage from './RegistrationPage.jsx'
import GamePage from './GamePage.jsx'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element={<IntroPage />} />
        <Route path = "/login" element={<LoginPage />} />
        <Route path = "/register" element={<RegistrationPage />} />
        <Route path = "/game" element={<GamePage />} />
      </Routes>
    </Router>
  )
}