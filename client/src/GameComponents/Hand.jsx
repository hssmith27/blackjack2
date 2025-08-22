import '../styles/Hand.css'
import Card from './Card.jsx'

export default function Hand({ hand, isDealer, hideDealerCard, isCurrent, message }) {
    return (
        <div>
            <div className={`hand ${isDealer ? "dealer" : "player"}  ${isCurrent ? "current" : ""}`}>
                {hand.map((text, idx) => (
                    <Card key={idx} card={text} hidden={idx === 1 && hideDealerCard}/>
                ))}
            </div>
            {message && <div className="message">{message}</div>}
        </div>
    );
}