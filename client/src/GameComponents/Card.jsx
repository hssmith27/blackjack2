import '../styles/Card.css'

export default function Card({ card, hidden }) {
    const suitSymbol = {
        S: "♠",
        H: "♥",
        D: "♦",
        C: "♣"
    };

    const rank = card.slice(0, -1);
    const suitLetter = card.slice(-1);
    const suit = suitSymbol[suitLetter];
    const isRed = suitLetter === "H" || suitLetter === "D";

    if (hidden) {
        return <div className="card back"></div>
    }
    
    return <div className={`card ${isRed ? "red" : "black"}`}>
        <div className="top">{rank}{suit}</div>
        <div className="bottom">{suit}{rank}</div>
    </div>
}