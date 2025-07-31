import { useState } from 'react'
import LoginPage from './LoginPage.jsx'
import './App.css'
import { createShoe, shuffle, calculateHandValue, isBust, isBlackjack } from './utils/deck.js'

export default function App() {
  return <LoginPage />;
}
