import IntroPage from './pages/IntroPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import GamePage from './pages/GamePage.jsx'
import './styles/App.css'
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