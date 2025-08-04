import { createShoe, shuffle, calculateHandValue, isBust, isBlackjack } from './utils/deck.js'

export default function GamePage() {
    return (
        <div className="landing-page">
            <h1>Welcome to 21 Tactics!</h1>
            <button onClick={() => navigate("/login")}>Log in</button>
            <button onClick={() => navigate("/register")}>Register</button>
        </div>
    );
}