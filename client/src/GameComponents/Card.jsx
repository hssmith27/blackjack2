import '../styles/Card.css'
import { useEffect, useState } from 'react';

export default function Card({ card, hidden, index }) {
    const [dealing, setDealing] = useState(true);

    const suitSymbol = { S: "♠", H: "♥", D: "♦", C: "♣" };
    const rank = card.slice(0, -1);
    const suitLetter = card.slice(-1);
    const suit = suitSymbol[suitLetter];
    const isRed = suitLetter === "H" || suitLetter === "D";

    useEffect(() => {
        const timer = setTimeout(() => setDealing(false), index * 150);
        return () => clearTimeout(timer);
    }, [index]);

    const classes = [
        "card",
        isRed ? "red" : "black",
        hidden ? "back" : "",
        dealing ? "dealing" : ""
    ].join(" ");

    return (
        <div className={classes}>
            {!hidden && (
                <>
                    <div className="top">{rank}{suit}</div>
                    <div className="bottom">{suit}{rank}</div>
                </>
            )}
        </div>
    );
}
