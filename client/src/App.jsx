import IntroPage from './IntroPage.jsx'
import LoginPage from './LoginPage.jsx'
import RegistrationPage from './RegistrationPage.jsx'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createShoe, shuffle, calculateHandValue, isBust, isBlackjack } from './utils/deck.js'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element={<IntroPage />} />
        <Route path = "/login" element={<LoginPage />} />
        <Route path = "/register" element={<RegistrationPage />} />
      </Routes>
    </Router>
  )
}