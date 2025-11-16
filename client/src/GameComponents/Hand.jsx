import '../styles/Hand.css'
import Card from './Card.jsx'

export default function Hand({ hand, isDealer, hideDealerCard, isCurrent, message, gameActive }) {
    const handClasses = [
        "hand",
        isDealer ? "dealer" : "player",
        isCurrent && gameActive ? "current" : ""
    ].join(" ");

    return (
        <div>
            <div className={handClasses}>
                {hand.map((text, idx) => (
                    <Card
                        key={idx}
                        card={text}
                        hidden={idx === 1 && hideDealerCard}
                        index={idx}
                    />
                ))}
            </div>
            {message && <div className="message">{message}</div>}
        </div>
    );
}